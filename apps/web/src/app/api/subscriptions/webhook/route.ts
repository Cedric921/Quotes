import { env } from "@/server/env";
import { route } from "@/server/http/route";
import { constructStripeEvent } from "@/server/integrations/stripe";
import { handleStripeWebhook } from "@/server/services/subscriptions.service";

/**
 * Stripe webhook. The signature covers the exact bytes Stripe sent, so the
 * body is read as text, never parsed first. Like NestJS it always answers
 * 201 with `{ received }`, failures included.
 */
export const POST = route({ auth: "public" }, async ({ req }) => {
  const webhookSecret = env().STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe] webhook secret not configured");
    return { received: false };
  }

  try {
    const rawBody = await req.text();
    const event = constructStripeEvent(rawBody, req.headers.get("stripe-signature") ?? "", webhookSecret);
    await handleStripeWebhook(event);
    return { received: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[stripe] webhook failed:", message);
    return { received: false, error: message };
  }
});
