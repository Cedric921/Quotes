import { route } from "@/server/http/route";
import { getUserSubscription } from "@/server/services/subscriptions.service";

// The NestJS controller declared this route twice with the same handler body;
// only the first registration ever answered.
export const GET = route({ auth: "admin" }, ({ params }) => getUserSubscription(params.userId));
