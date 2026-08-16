import { route } from "@/server/http/route";
import { getUserPayments } from "@/server/services/subscriptions.service";

export const GET = route({ auth: "user" }, ({ ctx }) => getUserPayments(ctx.userId));
