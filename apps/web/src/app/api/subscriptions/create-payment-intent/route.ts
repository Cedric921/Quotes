import { z } from "zod";
import { route } from "@/server/http/route";
import { createPaymentIntent } from "@/server/services/subscriptions.service";

export const POST = route({ auth: "user", body: z.object({ planId: z.string().optional() }) }, ({ ctx, body }) =>
  createPaymentIntent(ctx.userId, body.planId),
);
