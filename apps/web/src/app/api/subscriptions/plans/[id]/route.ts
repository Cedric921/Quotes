import { route } from "@/server/http/route";
import { deletePlan, findPlanById, updatePlan } from "@/server/services/plans.service";
import { planBody } from "../../schemas";

export const GET = route({ auth: "public" }, ({ params }) => findPlanById(params.id));

export const PUT = route({ auth: "admin", body: planBody.partial() }, ({ params, body }) => updatePlan(params.id, body));

export const DELETE = route({ auth: "admin" }, ({ params }) => deletePlan(params.id));
