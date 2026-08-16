import { z } from "zod";

/**
 * Every setting the server reads, in one place, with the defaults that keep a
 * fresh checkout running. Optional integrations default to "" and their code
 * treats an empty value as "not configured" rather than crashing.
 *
 * `JWT_SECRET` must hold the value the NestJS API signed with, so the
 * sessions of the apps already installed survive the move; rotate it once
 * every client has moved over.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  /** Public origin of this app, used in links sent by e-mail and Stripe redirects. */
  APP_URL: z.string().default("https://focus-admin.vercel.app"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  /** Direct (unpooled) URL for migrations; falls back to DATABASE_URL. */
  DATABASE_URL_UNPOOLED: z.string().default(""),
  DATABASE_SSL: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  DATABASE_LOGGING: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),

  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRATION: z.string().default("7d"),

  CLOUDINARY_CLOUD_NAME: z.string().default(""),
  CLOUDINARY_API_KEY: z.string().default(""),
  CLOUDINARY_API_SECRET: z.string().default(""),
  CLOUDINARY_FOLDER: z.string().default("themes"),

  BREVO_API_KEY: z.string().default(""),
  MAIL_FROM: z.string().default(""),
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.string().default("587"),
  SMTP_USER: z.string().default(""),
  SMTP_PASSWORD: z.string().default(""),
  SMTP_FROM: z.string().default(""),

  STRIPE_SECRET_KEY: z.string().default(""),
  STRIPE_PUBLISHABLE_KEY: z.string().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().default(""),
  STRIPE_MONTHLY_PRICE_ID: z.string().default(""),
  STRIPE_YEARLY_PRICE_ID: z.string().default(""),

  REVENUECAT_WEBHOOK_SECRET: z.string().default(""),
  REVENUECAT_IOS_API_KEY: z.string().default(""),
  REVENUECAT_ANDROID_API_KEY: z.string().default(""),

  DEEPL_API_KEY: z.string().default(""),
  DEEPL_API_PRO: z.string().default("false"),

  /** Bearer token the scheduled jobs send (Vercel Cron, GitHub Actions). */
  CRON_SECRET: z.string().default(""),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

export function env(): Env {
  if (!cached) {
    const result = schema.safeParse(process.env);
    if (!result.success) {
      const issue = result.error.issues[0];
      throw new Error(`Invalid environment: ${issue?.path.join(".")} ${issue?.message}`);
    }
    cached = result.data;
  }
  return cached;
}
