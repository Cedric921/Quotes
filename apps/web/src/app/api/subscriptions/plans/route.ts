import { z } from "zod";
import { route } from "@/server/http/route";
import { createPlan, findAllPlans } from "@/server/services/plans.service";
import { planBody } from "../schemas";

export const GET = route({ auth: "public", query: z.object({ activeOnly: z.string().optional() }) }, ({ query }) =>
  findAllPlans(query.activeOnly === "true"),
);

export const POST = route({ auth: "admin", body: planBody }, ({ body }) => createPlan(body));
