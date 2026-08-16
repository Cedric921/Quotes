import "server-only";
import Stripe from "stripe";
import { env } from "../env";
import { unavailable } from "../http/errors";

let client: Stripe | null | undefined;

/**
 * The Stripe client, created on first use from `STRIPE_SECRET_KEY`, or null
 * when the key is not set.
 *
 * The NestJS API fell back to a placeholder key, so every Stripe call failed
 * at Stripe with an opaque 500; here an unconfigured server says so (503).
 */
export function getStripe(): Stripe | null {
  if (client === undefined) {
    const key = env().STRIPE_SECRET_KEY;
    client = key ? new Stripe(key) : null;
  }
  return client;
}

export function requireStripe(): Stripe {
  const stripe = getStripe();
  if (!stripe) throw unavailable("Stripe is not configured");
  return stripe;
}

/**
 * Verifies a webhook payload against its `stripe-signature` header. Needs no
 * API key — only the webhook secret — so it works on the static helper.
 */
export function constructStripeEvent(rawBody: string, signature: string, secret: string): Stripe.Event {
  return Stripe.webhooks.constructEvent(rawBody, signature, secret);
}

/** Live keys produce PRODUCTION rows, test keys SANDBOX, as in NestJS. */
export function stripeIsLive(): boolean {
  return env().STRIPE_SECRET_KEY.startsWith("sk_live_");
}
