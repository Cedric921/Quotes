import { env } from "@/server/env";
import { route } from "@/server/http/route";
import {
  handleRevenueCatWebhook,
  revenueCatAuthorized,
  type RevenueCatWebhookPayload,
} from "@/server/services/revenuecat.service";

/** RevenueCat webhook. Like NestJS it always answers 201 with `{ received }`. */
export const POST = route({ auth: "public" }, async ({ req }) => {
  if (!revenueCatAuthorized(req.headers.get("authorization"), env().REVENUECAT_WEBHOOK_SECRET)) {
    console.error("[revenuecat] webhook authorization failed");
    return { received: false, error: "Unauthorized" };
  }

  try {
    const payload = (await req.json()) as RevenueCatWebhookPayload;
    await handleRevenueCatWebhook(payload);
    return { received: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[revenuecat] webhook error:", message);
    return { received: false, error: message };
  }
});
