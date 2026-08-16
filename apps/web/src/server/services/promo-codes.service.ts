import { repo } from "../db";
import { PromoCode, User } from "../db/entities";
import { badRequest, conflict, notFound } from "../http/errors";
import { publicUser } from "./serialize";

export interface CreatePromoCodeInput {
  code: string;
  expirationDate: string;
  durationDays: number;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdatePromoCodeInput {
  expirationDate?: string;
  durationDays?: number;
  description?: string | null;
}

export async function createPromoCode(dto: CreatePromoCodeInput): Promise<PromoCode> {
  const promoRepo = await repo(PromoCode);
  const existing = await promoRepo.findOne({ where: { code: dto.code } });
  if (existing) throw conflict("Promo code already exists");

  const promoCode = promoRepo.create({ ...dto, expirationDate: new Date(dto.expirationDate) });
  return promoRepo.save(promoCode);
}

export async function findAllPromoCodes(): Promise<PromoCode[]> {
  return (await repo(PromoCode)).find({ order: { createdAt: "DESC" } });
}

export async function findPromoCode(id: string): Promise<PromoCode> {
  const promoCode = await (await repo(PromoCode)).findOne({ where: { id } });
  if (!promoCode) throw notFound("Promo code not found");
  return promoCode;
}

export async function findPromoCodeByCode(code: string): Promise<PromoCode | null> {
  return (await repo(PromoCode)).findOne({ where: { code } });
}

export async function updatePromoCode(id: string, dto: UpdatePromoCodeInput): Promise<PromoCode> {
  const promoCode = await findPromoCode(id);

  if (dto.expirationDate) promoCode.expirationDate = new Date(dto.expirationDate);
  if (dto.durationDays !== undefined) promoCode.durationDays = dto.durationDays;
  if (dto.description !== undefined) promoCode.description = dto.description;

  return (await repo(PromoCode)).save(promoCode);
}

export async function deletePromoCode(id: string): Promise<void> {
  const promoCode = await findPromoCode(id);
  await (await repo(PromoCode)).remove(promoCode);
}

export async function getUsersByPromoCode(code: string) {
  const users = await (await repo(User)).find({
    where: { usedPromoCode: code },
    select: ["id", "email", "name", "createdAt", "isSubscribed", "subscriptionEndDate"],
    order: { createdAt: "DESC" },
  });
  return users.map(publicUser);
}

export async function incrementPromoCodeUsage(code: string): Promise<void> {
  await (await repo(PromoCode)).increment({ code }, "usageCount", 1);
}

export async function validatePromoCode(code: string | undefined): Promise<PromoCode> {
  // `{ code: undefined }` would match the first promo code in the table, so a
  // request without a code must not reach the query.
  const promoCode = code ? await findPromoCodeByCode(code) : null;
  if (!promoCode) throw notFound("Invalid promo code");

  if (!promoCode.isActive) throw badRequest("This promo code is no longer active");

  if (new Date(promoCode.expirationDate) < new Date()) {
    throw badRequest("This promo code has expired");
  }

  return promoCode;
}
