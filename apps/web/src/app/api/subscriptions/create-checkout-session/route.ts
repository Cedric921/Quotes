import { z } from "zod";
import { env } from "@/server/env";
import { route } from "@/server/http/route";
import { createCheckoutSession } from "@/server/services/subscriptions.service";

const body = z.object({
  planId: z.string().optional(),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
});

export const POST = route({ auth: "user", body }, ({ ctx, body }) => {
  // The default pages are the plain HTML ones below, served by this app
  // (NestJS pointed at its own API_URL).
  const base = env().APP_URL.replace(/\/$/, "");
  return createCheckoutSession(
    ctx.userId,
    body.planId,
    body.successUrl || `${base}/api/subscriptions/payment-success`,
    body.cancelUrl || `${base}/api/subscriptions/payment-cancel`,
  );
});
