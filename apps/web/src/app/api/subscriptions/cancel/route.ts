import { route } from "@/server/http/route";
import { cancelSubscription } from "@/server/services/subscriptions.service";

export const POST = route({ auth: "user" }, ({ ctx }) => cancelSubscription(ctx.userId));
