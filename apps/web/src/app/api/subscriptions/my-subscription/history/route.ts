import { route } from "@/server/http/route";
import { getUserSubscriptionHistory } from "@/server/services/subscriptions.service";

export const GET = route({ auth: "user" }, ({ ctx }) => getUserSubscriptionHistory(ctx.userId));
