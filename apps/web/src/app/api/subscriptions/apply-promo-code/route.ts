import { z } from "zod";
import { route } from "@/server/http/route";
import { validatePromoCode } from "@/server/services/promo-codes.service";
import { applyPromoCode } from "@/server/services/subscriptions.service";

export const POST = route({ auth: "user", body: z.object({ code: z.string().optional() }) }, async ({ ctx, body }) => {
  const promoCode = await validatePromoCode(body.code);
  await applyPromoCode(ctx.userId, promoCode);
  return {
    success: true,
    message: `Promo code applied! You now have ${promoCode.durationDays} days of premium access.`,
    durationDays: promoCode.durationDays,
  };
});
