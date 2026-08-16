import { after } from "next/server";
import { z } from "zod";
import { route } from "@/server/http/route";
import { notifyNewPremiumQuotes } from "@/server/services/notifications.service";
import { bulkImportQuotes, premiumQuotesAmong } from "@/server/services/quotes.service";

export const POST = route(
  {
    auth: "admin",
    body: z.object({
      topicId: z.string(),
      quotes: z.array(z.object({ text: z.string(), author: z.string().nullish() })),
    }),
  },
  async ({ body }) => {
    const result = await bulkImportQuotes(body);
    // Premium imports are announced at once, after the response (replaces the hourly cron).
    after(async () => {
      const premium = await premiumQuotesAmong(result.quotes.map((quote) => quote.id));
      if (premium.length > 0) await notifyNewPremiumQuotes(premium);
    });
    return result;
  },
);
