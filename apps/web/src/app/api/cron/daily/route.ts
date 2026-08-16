import { route } from "@/server/http/route";
import { sendDailyPremiumQuote } from "@/server/services/notifications.service";
import { expireSubscriptions } from "@/server/services/subscriptions.service";
import { assertCronAuthorized } from "../_auth";

export const maxDuration = 60;

/**
 * The once-a-day job (Vercel Cron, `vercel.json`, 15:00 UTC): the random
 * premium quote NestJS sent at 15:00, and the expiry of the subscriptions
 * whose end date has passed. Each step runs even if the other fails; any
 * failure makes the run answer 500 so it shows up in the cron logs.
 */
async function run<T>(name: string, step: () => Promise<T>) {
  try {
    return { ok: true as const, result: await step() };
  } catch (error) {
    console.error(`[cron/daily] ${name} failed`, error);
    return { ok: false as const, error: error instanceof Error ? error.message : String(error) };
  }
}

const handler = route({ auth: "public" }, async ({ req }) => {
  assertCronAuthorized(req);

  const premiumQuote = await run("premiumQuote", sendDailyPremiumQuote);
  const subscriptions = await run("expireSubscriptions", expireSubscriptions);

  const ok = premiumQuote.ok && subscriptions.ok;
  return Response.json({ ok, premiumQuote, subscriptions }, { status: ok ? 200 : 500 });
});

export const GET = handler;
export const POST = handler;
