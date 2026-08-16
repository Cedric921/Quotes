import { z } from "zod";

/**
 * Body and query shapes shared by the subscription routes. NestJS never ran
 * its DTO validators, so these accept what the services actually read and
 * nothing stricter: numbers may arrive as numeric strings from admin forms.
 */
const numeric = z.union([z.number(), z.string()]);

export const planBody = z.object({
  name: z.string(),
  description: z.string().nullish(),
  price: numeric,
  durationMonths: z.coerce.number().optional(),
  isActive: z.boolean().optional(),
});

export const pageQuery = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  environment: z.string().optional(),
});

export const environmentQuery = z.object({ environment: z.string().optional() });

/** `parseInt` with the controller's defaults, which also stand in for garbage. */
export function intOr(raw: string | undefined, fallback: number): number {
  const value = raw ? parseInt(raw, 10) : fallback;
  return Number.isFinite(value) && value > 0 ? value : fallback;
}
