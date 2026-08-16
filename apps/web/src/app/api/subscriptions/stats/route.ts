import { route } from "@/server/http/route";
import { getStats } from "@/server/services/subscriptions.service";
import { environmentQuery } from "../schemas";

export const GET = route({ auth: "admin", query: environmentQuery }, ({ query }) => getStats(query.environment));
