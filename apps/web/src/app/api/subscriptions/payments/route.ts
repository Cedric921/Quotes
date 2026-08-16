import { route } from "@/server/http/route";
import { getAllPayments } from "@/server/services/subscriptions.service";
import { intOr, pageQuery } from "../schemas";

export const GET = route({ auth: "admin", query: pageQuery }, ({ query }) =>
  getAllPayments(intOr(query.page, 1), intOr(query.limit, 20), query.environment),
);
