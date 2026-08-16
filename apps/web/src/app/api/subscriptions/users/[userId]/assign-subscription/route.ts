import { z } from "zod";
import { route } from "@/server/http/route";
import { assignSubscriptionToUser } from "@/server/services/subscriptions.service";

const body = z.object({ planId: z.string().optional(), adminPassword: z.string().optional() });

export const POST = route({ auth: "admin", body }, ({ ctx, params, body }) =>
  assignSubscriptionToUser(params.userId, body.planId, ctx.userId, body.adminPassword),
);
