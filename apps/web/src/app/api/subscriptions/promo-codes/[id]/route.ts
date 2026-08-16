import { z } from "zod";
import { route } from "@/server/http/route";
import { deletePromoCode, findPromoCode, updatePromoCode } from "@/server/services/promo-codes.service";

const body = z.object({
  expirationDate: z.string().optional(),
  durationDays: z.coerce.number().optional(),
  description: z.string().nullish(),
});

export const GET = route({ auth: "admin" }, ({ params }) => findPromoCode(params.id));

export const PUT = route({ auth: "admin", body }, ({ params, body }) => updatePromoCode(params.id, body));

export const DELETE = route({ auth: "admin" }, async ({ params }) => {
  await deletePromoCode(params.id);
  return { success: true };
});
