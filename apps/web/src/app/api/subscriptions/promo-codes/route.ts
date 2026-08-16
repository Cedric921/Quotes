import { z } from "zod";
import { route } from "@/server/http/route";
import { createPromoCode, findAllPromoCodes } from "@/server/services/promo-codes.service";

const body = z.object({
  code: z.string(),
  expirationDate: z.string(),
  durationDays: z.coerce.number(),
  description: z.string().nullish(),
  isActive: z.boolean().optional(),
});

export const GET = route({ auth: "admin" }, () => findAllPromoCodes());

export const POST = route({ auth: "admin", body }, ({ body }) => createPromoCode(body));
