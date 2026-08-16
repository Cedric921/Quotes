import { route } from "@/server/http/route";
import { getUserPayments } from "@/server/services/subscriptions.service";
import { environmentQuery } from "../../../schemas";

export const GET = route({ auth: "admin", query: environmentQuery }, ({ params, query }) =>
  getUserPayments(params.userId, query.environment),
);
