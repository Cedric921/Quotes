import { route } from "@/server/http/route";
import { getUserSubscription } from "@/server/services/subscriptions.service";

export const GET = route({ auth: "user" }, ({ ctx }) => getUserSubscription(ctx.userId));
