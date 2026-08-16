import { after } from "next/server";
import { z } from "zod";
import { route } from "@/server/http/route";
import { notifyNewPremiumQuotes } from "@/server/services/notifications.service";
import { createQuote, findQuotes, premiumQuotesAmong } from "@/server/services/quotes.service";

/**
 * The mobile feed. Parameters are read by hand, as the NestJS controller did:
 * `page` and `limit` go through parseInt and paginate only when both are
 * truthy, and premium quotes are included unless `includePremium=false`.
 * `isLiked` is computed for the `userId` query parameter, not the token.
 */
export const GET = route({ auth: "public" }, async ({ req }) => {
  const params = req.nextUrl.searchParams;
  const page = params.get("page");
  const limit = params.get("limit");
  return findQuotes({
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
    topicId: params.get("topicId") || undefined,
    userId: params.get("userId") || undefined,
    includePremium: params.get("includePremium") !== "false",
    seed: params.get("seed") || undefined,
  });
});

// Was public in NestJS: anyone could write to the catalogue.
export const POST = route(
  {
    auth: "admin",
    body: z.object({
      text: z.string(),
      author: z.string().nullish(),
      topicId: z.string().nullish(),
    }),
  },
  async ({ body }) => {
    const quote = await createQuote(body);
    // Premium quotes are announced right away (this replaces the hourly cron),
    // after the response so the admin does not wait on the push fan-out.
    after(async () => {
      const premium = await premiumQuotesAmong([quote.id]);
      if (premium.length > 0) await notifyNewPremiumQuotes(premium);
    });
    return quote;
  },
);
