import "server-only";
import Stripe from "stripe";
import { v2 as cloudinary } from "cloudinary";
import { getDb } from "../db";
import { env } from "../env";
import { mailProvider } from "../integrations/mail";

export interface ServiceStatus {
  status: "connected" | "disconnected" | "error" | "not_configured";
  message?: string;
  latency?: number;
}

export interface DatabaseStatus extends ServiceStatus {
  type: "postgres";
}

export interface StripeStatus extends ServiceStatus {
  mode?: "test" | "live";
  webhookConfigured?: boolean;
  apiKeyConfigured?: boolean;
}

export interface RevenueCatStatus extends ServiceStatus {
  webhookConfigured?: boolean;
  apiKeyConfigured?: boolean;
  iosApiKeyConfigured?: boolean;
  androidApiKeyConfigured?: boolean;
}

export interface MailStatus extends ServiceStatus {
  provider: "brevo" | "smtp" | "none";
}

export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services: {
    database: DatabaseStatus;
    stripe: StripeStatus;
    revenuecat: RevenueCatStatus;
    cloudinary: ServiceStatus;
    mail: MailStatus;
  };
}

/** A value counts as configured when set and not a `placeholder` left from a template. */
const configured = (value: string) => !!value && !value.includes("placeholder");

export async function checkHealth(): Promise<HealthCheckResponse> {
  const [database, stripe, revenuecat, cloudinaryStatus] = await Promise.all([
    checkDatabase(),
    checkStripe(),
    Promise.resolve(checkRevenueCat()),
    checkCloudinary(),
  ]);
  const mail = checkMail();

  let status: HealthCheckResponse["status"] = "healthy";
  if (database.status === "error" || database.status === "disconnected") {
    status = "unhealthy";
  } else if (stripe.status === "error" || revenuecat.status === "error" || cloudinaryStatus.status === "error") {
    status = "degraded";
  } else if (
    stripe.status === "not_configured" ||
    revenuecat.status === "not_configured" ||
    cloudinaryStatus.status === "not_configured" ||
    mail.status === "not_configured"
  ) {
    status = "degraded";
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    services: { database, stripe, revenuecat, cloudinary: cloudinaryStatus, mail },
  };
}

/**
 * Mail that is not configured shows nowhere else: the reset request answers
 * "success" even when nothing is sent. This is where the active path is read.
 */
function checkMail(): MailStatus {
  const provider = mailProvider();
  if (provider === "none") {
    return {
      status: "not_configured",
      provider,
      message: "No BREVO_API_KEY and no SMTP credentials — password reset codes are only logged",
    };
  }
  return {
    status: "connected",
    provider,
    message: provider === "brevo" ? "Sending through the Brevo HTTP API" : "Sending over SMTP",
  };
}

function checkRevenueCat(): RevenueCatStatus {
  const config = env();
  const webhookConfigured = configured(config.REVENUECAT_WEBHOOK_SECRET);
  const iosApiKeyConfigured = configured(config.REVENUECAT_IOS_API_KEY);
  const androidApiKeyConfigured = configured(config.REVENUECAT_ANDROID_API_KEY);
  const apiKeyConfigured = iosApiKeyConfigured || androidApiKeyConfigured;
  const flags = { webhookConfigured, apiKeyConfigured, iosApiKeyConfigured, androidApiKeyConfigured };

  if (!webhookConfigured && !apiKeyConfigured) {
    return { status: "not_configured", message: "RevenueCat is not configured", ...flags };
  }
  return { status: "connected", message: "RevenueCat webhook configured", ...flags };
}

async function checkDatabase(): Promise<DatabaseStatus> {
  const startTime = Date.now();
  try {
    await (await getDb()).query("SELECT 1");
    return {
      status: "connected",
      message: "PostgreSQL (Supabase) connection successful",
      latency: Date.now() - startTime,
      type: "postgres",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Database connection failed",
      latency: Date.now() - startTime,
      type: "postgres",
    };
  }
}

async function checkStripe(): Promise<StripeStatus> {
  const config = env();
  const stripeKey = config.STRIPE_SECRET_KEY;
  const webhookConfigured = configured(config.STRIPE_WEBHOOK_SECRET);

  if (!configured(stripeKey)) {
    return {
      status: "not_configured",
      message: "Stripe API key not configured",
      apiKeyConfigured: false,
      webhookConfigured,
    };
  }

  const mode: "test" | "live" = stripeKey.startsWith("sk_live_") ? "live" : "test";
  const startTime = Date.now();
  try {
    await new Stripe(stripeKey).balance.retrieve();
    return {
      status: "connected",
      message: "Stripe connection successful",
      latency: Date.now() - startTime,
      mode,
      apiKeyConfigured: true,
      webhookConfigured,
    };
  } catch (error) {
    const message =
      error instanceof Stripe.errors.StripeAuthenticationError
        ? "Invalid API key"
        : error instanceof Error
          ? error.message
          : "Stripe connection failed";
    return { status: "error", message, latency: Date.now() - startTime, mode, apiKeyConfigured: true, webhookConfigured };
  }
}

async function checkCloudinary(): Promise<ServiceStatus> {
  const config = env();
  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = config;
  if (!cloudName || !apiKey || !apiSecret) {
    return { status: "not_configured", message: "Cloudinary credentials not configured" };
  }

  const startTime = Date.now();
  try {
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    const result = (await cloudinary.api.ping()) as { status?: string };
    if (result.status === "ok") {
      return { status: "connected", message: "Cloudinary connection successful", latency: Date.now() - startTime };
    }
    return { status: "error", message: "Cloudinary ping failed", latency: Date.now() - startTime };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Cloudinary connection failed",
      latency: Date.now() - startTime,
    };
  }
}

export function ping(): { status: string; timestamp: string } {
  return { status: "ok", timestamp: new Date().toISOString() };
}

/** Row counts for the admin dashboard. Never throws: a failure is reported in the body. */
export async function getStats() {
  try {
    const db = await getDb();
    const [users, topics, quotes] = (await Promise.all([
      db.query('SELECT COUNT(*) as count FROM "user"'),
      db.query("SELECT COUNT(*) as count FROM topic"),
      db.query("SELECT COUNT(*) as count FROM quote"),
    ])) as { count?: string }[][];

    return {
      users: Number.parseInt(users[0]?.count || "0", 10),
      topics: Number.parseInt(topics[0]?.count || "0", 10),
      quotes: Number.parseInt(quotes[0]?.count || "0", 10),
      timestamp: new Date().toISOString(),
    };
  } catch {
    return { users: 0, topics: 0, quotes: 0, error: "Failed to fetch stats", timestamp: new Date().toISOString() };
  }
}
