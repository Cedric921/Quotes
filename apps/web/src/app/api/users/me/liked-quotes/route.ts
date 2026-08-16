import { route } from "@/server/http/route";
import { getLikedQuotes } from "@/server/services/users.service";

export const GET = route({ auth: "user" }, async ({ ctx }) => getLikedQuotes(ctx.userId));
