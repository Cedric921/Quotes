import { repo } from "../db";
import { AppConfig, CONFIG_KEYS, DEFAULT_CONFIG, SubscriptionPlan } from "../db/entities";
import { notFound } from "../http/errors";

// ============ CONFIG ============

/** Every config key, with the defaults filled in for the ones never saved. */
export async function getConfig(): Promise<Record<string, string>> {
  const configs = await (await repo(AppConfig)).find();
  const configMap: Record<string, string> = { ...DEFAULT_CONFIG };
  for (const config of configs) configMap[config.key] = config.value;
  return configMap;
}

export interface UpdateConfigInput {
  freemiumDurationDays?: number | string;
  // The DTO also declared prices and Stripe price ids, but the NestJS service
  // only ever persisted the freemium duration; the others are accepted and
  // ignored, as before.
}

export async function updateConfig(dto: UpdateConfigInput): Promise<Record<string, string>> {
  const configRepo = await repo(AppConfig);
  const updates: { key: string; value: string }[] = [];

  if (dto.freemiumDurationDays !== undefined) {
    updates.push({ key: CONFIG_KEYS.FREEMIUM_DURATION_DAYS, value: String(dto.freemiumDurationDays) });
  }

  for (const update of updates) {
    let config = await configRepo.findOne({ where: { key: update.key } });
    if (config) {
      config.value = update.value;
    } else {
      config = configRepo.create(update);
    }
    await configRepo.save(config);
  }

  return getConfig();
}

// ============ SUBSCRIPTION PLANS ============

export interface PlanInput {
  name?: string;
  description?: string | null;
  price?: number | string;
  durationMonths?: number;
  isActive?: boolean;
}

export async function createPlan(dto: PlanInput): Promise<SubscriptionPlan> {
  const planRepo = await repo(SubscriptionPlan);
  const plan = planRepo.create({ ...dto, durationMonths: dto.durationMonths || 1 });
  return planRepo.save(plan);
}

export async function findAllPlans(activeOnly = false): Promise<SubscriptionPlan[]> {
  const where = activeOnly ? { isActive: true } : {};
  return (await repo(SubscriptionPlan)).find({ where, order: { price: "ASC" } });
}

export async function findPlanById(id: string | undefined): Promise<SubscriptionPlan> {
  // TypeORM drops an undefined condition, so `{ id: undefined }` matched the
  // first plan in the table: a request without `planId` bought a random plan.
  if (!id) throw notFound("Subscription plan not found");
  const plan = await (await repo(SubscriptionPlan)).findOne({ where: { id } });
  if (!plan) throw notFound("Subscription plan not found");
  return plan;
}

export async function updatePlan(id: string, dto: PlanInput): Promise<SubscriptionPlan> {
  const plan = await findPlanById(id);
  Object.assign(plan, dto);
  return (await repo(SubscriptionPlan)).save(plan);
}

export async function deletePlan(id: string): Promise<void> {
  const plan = await findPlanById(id);
  await (await repo(SubscriptionPlan)).softDelete(plan.id);
}
