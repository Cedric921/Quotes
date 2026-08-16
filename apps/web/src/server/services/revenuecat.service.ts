import { timingSafeEqual } from "node:crypto";
import { repo } from "../db";
import { Subscription, SubscriptionEnvironment, SubscriptionPlan, SubscriptionStatus, User } from "../db/entities";
import { notFound } from "../http/errors";

/** Entitlement identifier configured in the RevenueCat dashboard. */
const ENTITLEMENT_ID = "Focus Pro";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export interface RevenueCatEventBody {
  type?: string;
  app_user_id?: string;
  entitlement_ids?: string[];
  expiration_at_ms?: number;
  id?: string;
  price?: number;
  // RevenueCat sends 'SANDBOX' for App Store sandbox / Play test track,
  // 'PRODUCTION' for real customers
  environment?: "SANDBOX" | "PRODUCTION";
}

export interface RevenueCatWebhookPayload {
  event?: RevenueCatEventBody;
}

/**
 * The webhook's `Authorization` header must be `Bearer <secret>`. As in
 * NestJS, the check only applies when a secret is configured; the comparison
 * is constant-time so the secret cannot be guessed byte by byte.
 */
export function revenueCatAuthorized(authorization: string | null, secret: string): boolean {
  // Without a secret NestJS accepted any request, which let anyone grant
  // premium to any account. Only a local setup may run without one.
  if (!secret) return process.env.NODE_ENV !== "production";
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(authorization ?? "");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function handleRevenueCatWebhook(payload: RevenueCatWebhookPayload): Promise<void> {
  const event = payload?.event ?? {};
  console.log("[revenuecat] webhook received:", event.type);

  const appUserId = event.app_user_id;
  const entitlements = event.entitlement_ids ?? [];

  if (!appUserId) {
    console.log("[revenuecat] no app_user_id in event");
    return;
  }

  switch (event.type) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "PRODUCT_CHANGE":
      await activateRevenueCatSubscription(appUserId, entitlements, event);
      break;
    case "CANCELLATION":
    case "EXPIRATION":
      await deactivateRevenueCatSubscription(appUserId);
      break;
    default:
      console.log(`[revenuecat] unhandled event type: ${event.type}`);
  }
}

async function activateRevenueCatSubscription(
  userId: string,
  entitlements: string[],
  event: RevenueCatEventBody,
): Promise<void> {
  const userRepo = await repo(User);
  const planRepo = await repo(SubscriptionPlan);
  const subscriptionRepo = await repo(Subscription);

  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) {
    console.log(`[revenuecat] user ${userId} not found`);
    return;
  }

  // Only activate when the configured entitlement is granted
  if (entitlements.length > 0 && !entitlements.includes(ENTITLEMENT_ID)) {
    console.log(`[revenuecat] event ignored: entitlement "${ENTITLEMENT_ID}" not in [${entitlements.join(", ")}]`);
    return;
  }

  const expirationDate = event.expiration_at_ms
    ? new Date(event.expiration_at_ms)
    : new Date(Date.now() + THIRTY_DAYS_MS); // default 30 days

  // Premium = isSubscribed + subscriptionEndDate > now
  user.isSubscribed = true;
  user.subscriptionEndDate = expirationDate;
  await userRepo.save(user);

  // Get or create the plan store subscriptions are filed under. Backward
  // compatibility: also match the legacy name "RevenueCat Premium".
  let plan = await planRepo.findOne({ where: [{ name: "Premium" }, { name: "RevenueCat Premium" }] });
  if (!plan) {
    plan = await planRepo.save(
      planRepo.create({
        name: "Premium",
        description: "Premium subscription via App Store / Google Play",
        price: 0, // price managed by the stores
        durationMonths: 1,
        isActive: true,
      }),
    );
  } else if (plan.name === "RevenueCat Premium") {
    // Migrate the legacy plan name in place
    plan.name = "Premium";
    await planRepo.save(plan);
  }

  await subscriptionRepo.save(
    subscriptionRepo.create({
      userId: user.id,
      user,
      planId: plan.id,
      plan,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate: expirationDate,
      stripePaymentIntentId: `rc_${event.id ?? Date.now()}`,
      // Sandbox events should not pollute real revenue: keep the price RC
      // reports but flag the row so admin filters can hide it.
      amountPaid: event.price ?? 0,
      environment:
        event.environment === "SANDBOX" ? SubscriptionEnvironment.SANDBOX : SubscriptionEnvironment.PRODUCTION,
    }),
  );
  console.log(`[revenuecat] subscription activated for user ${userId}`);
}

async function deactivateRevenueCatSubscription(userId: string): Promise<void> {
  const userRepo = await repo(User);
  const subscriptionRepo = await repo(Subscription);

  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) return;

  user.isSubscribed = false;
  await userRepo.save(user);

  const activeSubscriptions = await subscriptionRepo.find({
    where: { userId, status: SubscriptionStatus.ACTIVE },
  });
  for (const subscription of activeSubscriptions) {
    subscription.status = SubscriptionStatus.CANCELLED;
    await subscriptionRepo.save(subscription);
  }

  console.log(`[revenuecat] subscription deactivated for user ${userId}`);
}

/**
 * Called by the mobile app after a purchase or restore, with the
 * entitlements the RevenueCat SDK reports.
 */
export async function syncRevenueCatEntitlements(
  userId: string,
  revenueCatUserId: string | undefined,
  entitlements: string[],
): Promise<{ synced: boolean; isPremium: boolean }> {
  const userRepo = await repo(User);
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) throw notFound("User not found");

  const hasPremium = entitlements.includes(ENTITLEMENT_ID);

  if (user.isSubscribed !== hasPremium) {
    user.isSubscribed = hasPremium;
    if (hasPremium && !user.subscriptionEndDate) {
      // Default to 30 days if no end date is set yet
      user.subscriptionEndDate = new Date(Date.now() + THIRTY_DAYS_MS);
    }
    await userRepo.save(user);
    console.log(`[revenuecat] user ${userId} (rc: ${revenueCatUserId}) premium synced: ${hasPremium}`);
  }

  return { synced: true, isPremium: hasPremium };
}
