import "server-only";
import { after } from "next/server";
import nodemailer from "nodemailer";
import { env } from "../env";
import { passwordResetMail, type RenderedMail } from "./mail-templates";

const RESET_CODE_TTL_MINUTES = 15;
const ATTEMPTS = 3;

/**
 * Everything Focus sends by e-mail.
 *
 * Brevo's HTTP API comes first, SMTP is the fallback, and with neither the
 * code is logged so development is never blocked — the same order the NestJS
 * service used. What changed is the retry: a timer outliving the response
 * does not survive on serverless, so delivery runs in `after()`, which keeps
 * the function alive once the response has gone, and retries there.
 */
export function mailProvider(): "brevo" | "smtp" | "none" {
  const config = env();
  if (config.BREVO_API_KEY) return "brevo";
  return config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASSWORD ? "smtp" : "none";
}

export function sendPasswordResetCode(email: string, code: string, name?: string | null, locale?: string | null) {
  const mail = passwordResetMail({ locale, code, name: name ?? undefined, ttlMinutes: RESET_CODE_TTL_MINUTES });

  if (mailProvider() === "none") {
    console.log(`[mail] (DEV) Reset code for ${email}: ${code} (expires in ${RESET_CODE_TTL_MINUTES} min)`);
    return;
  }

  // The caller answers the same way whether an account exists or not, so the
  // send never delays or changes the response.
  after(() => deliver(email, mail));
}

async function deliver(to: string, mail: RenderedMail): Promise<void> {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      if (mailProvider() === "brevo") await sendOverHttp(to, mail);
      else await sendOverSmtp(to, mail);
      console.log(`[mail] Sent "${mail.subject}" to ${to}`);
      return;
    } catch (error) {
      console.warn(`[mail] Delivery to ${to} failed (attempt ${attempt}): ${(error as Error).message.slice(0, 300)}`);
      if (attempt < ATTEMPTS) await new Promise((resolve) => setTimeout(resolve, attempt * 2_000));
    }
  }
  console.error(`[mail] Giving up on ${to} after ${ATTEMPTS} attempts`);
}

function from(): string {
  const config = env();
  return config.MAIL_FROM || config.SMTP_FROM || "Focus <noreply@focus.app>";
}

async function sendOverSmtp(to: string, mail: RenderedMail) {
  const config = env();
  const port = Number.parseInt(config.SMTP_PORT || "587", 10);
  const transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: config.SMTP_USER, pass: config.SMTP_PASSWORD },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
  });
  try {
    await transporter.sendMail({ from: from(), to, subject: mail.subject, text: mail.text, html: mail.html });
  } finally {
    transporter.close();
  }
}

async function sendOverHttp(to: string, mail: RenderedMail) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json", "api-key": env().BREVO_API_KEY },
    body: JSON.stringify({
      sender: senderFrom(from()),
      to: [{ email: to }],
      subject: mail.subject,
      textContent: mail.text,
      htmlContent: mail.html,
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    // "sender not valid" names the usual mistake: MAIL_FROM is not the sender verified at Brevo.
    throw new Error(`Brevo ${response.status}: ${detail.slice(0, 300) || response.statusText}`);
  }
}

/** `Focus <noreply@focus.app>` split into what the Brevo API expects. */
function senderFrom(value: string): { email: string; name?: string } {
  const angled = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(value);
  if (!angled) return { email: value.trim() };
  const name = angled[1].replace(/^"|"$/g, "").trim();
  return name ? { email: angled[2].trim(), name } : { email: angled[2].trim() };
}
