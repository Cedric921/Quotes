import { route } from "@/server/http/route";
import { likeQuote, unlikeQuote } from "@/server/services/quotes.service";

export const POST = route({ auth: "user" }, ({ params, ctx }) => likeQuote(params.id, ctx.userId));

export const DELETE = route({ auth: "user" }, ({ params, ctx }) => unlikeQuote(params.id, ctx.userId));
