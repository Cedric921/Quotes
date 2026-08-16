import { z } from "zod";
import { route } from "@/server/http/route";
import { findQuote, removeQuote, updateQuote } from "@/server/services/quotes.service";

export const GET = route({ auth: "public" }, ({ req, params }) =>
  findQuote(params.id, req.nextUrl.searchParams.get("userId") || undefined),
);

// PATCH and DELETE were public in NestJS.
export const PATCH = route(
  {
    auth: "admin",
    body: z.object({
      text: z.string().optional(),
      author: z.string().nullish(),
      topicId: z.string().nullish(),
    }),
  },
  ({ params, body }) => updateQuote(params.id, body),
);

export const DELETE = route({ auth: "admin" }, ({ params }) => removeQuote(params.id));
