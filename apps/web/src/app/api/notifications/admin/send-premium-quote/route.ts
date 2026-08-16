import { route } from "@/server/http/route";
import { sendManualPremiumQuoteNotification } from "@/server/services/notifications.service";

export const maxDuration = 60;

/**
 * `{ quoteId? }`, the body optional: without a quote id a random premium
 * quote goes out, so an empty POST is as valid as it was in NestJS.
 */
export const POST = route({ auth: "admin" }, async ({ req }) => {
  const raw: unknown = await req.json().catch(() => ({}));
  const quoteId =
    raw && typeof raw === "object" && typeof (raw as { quoteId?: unknown }).quoteId === "string"
      ? (raw as { quoteId: string }).quoteId
      : undefined;
  return sendManualPremiumQuoteNotification(quoteId || undefined);
});
