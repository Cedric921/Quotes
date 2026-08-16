import bcrypt from "bcryptjs";
import type Stripe from "stripe";
import { Between, LessThanOrEqual, MoreThan } from "typeorm";
import { repo } from "../db";
import { Subscription, SubscriptionEnvironment, SubscriptionStatus, User } from "../db/entities";
import { badRequest, notFound, unauthorized } from "../http/errors";
import { requireStripe, stripeIsLive } from "../integrations/stripe";
import { findPlanById } from "./plans.service";
import { incrementPromoCodeUsage } from "./promo-codes.service";
import { isPremium } from "./premium";
import { publicUser } from "./serialize";
import type { PromoCode } from "../db/entities";

/**
 * Normalize the ?environment query string into a value the where-clause can
 * consume. Returns undefined when the caller asked for everything (or sent
 * an unrecognized value) so callers can spread it into `where`.
 */
function parseEnvironment(raw?: string): SubscriptionEnvironment | undefined {
  if (!raw) return undefined;
  const upper = raw.toUpperCase();
  if (upper === "PRODUCTION") return SubscriptionEnvironment.PRODUCTION;
  if (upper === "SANDBOX") return SubscriptionEnvironment.SANDBOX;
  return undefined;
}

/** The admin dashboard shows a live subscription as a successful payment. */
function paymentStatus(status: SubscriptionStatus): string {
  return status === SubscriptionStatus.ACTIVE ? "SUCCEEDED" : status;
}

function addMonths(from: Date, months: number): Date {
  const date = new Date(from);
  date.setMonth(date.getMonth() + months);
  return date;
}

// ============ STATISTICS ============

export async function getStats(environment?: string) {
  const envFilter = parseEnvironment(environment);
  const userRepo = await repo(User);
  const subscriptionRepo = await repo(Subscription);

  // Premium/free counts are user-level (no environment column on user), so
  // they stay accurate across both modes. Only revenue + transaction lists
  // are scoped by environment.
  const totalUsers = await userRepo.count();
  const premiumUsers = await userRepo.count({ where: { isSubscribed: true } });
  const freeUsers = totalUsers - premiumUsers;
  const premiumPercentage = totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0;

  // All active subscriptions for revenue calculation (scoped by environment)
  const allSubscriptions = await subscriptionRepo.find({
    where: { status: SubscriptionStatus.ACTIVE, ...(envFilter ? { environment: envFilter } : {}) },
    relations: ["plan"],
  });

  const totalRevenue = allSubscriptions.reduce((sum, sub) => sum + Number(sub.amountPaid || 0), 0);

  // Monthly revenue (subscriptions created this month)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyRevenue = allSubscriptions
    .filter((sub) => new Date(sub.createdAt) >= startOfMonth)
    .reduce((sum, sub) => sum + Number(sub.amountPaid || 0), 0);

  // Revenue growth, compared to last month
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const lastMonthSubscriptions = await subscriptionRepo.find({
    where: {
      status: SubscriptionStatus.ACTIVE,
      createdAt: Between(startOfLastMonth, endOfLastMonth),
      ...(envFilter ? { environment: envFilter } : {}),
    },
  });
  const lastMonthRevenue = lastMonthSubscriptions.reduce((sum, sub) => sum + Number(sub.amountPaid || 0), 0);
  const revenueGrowth =
    lastMonthRevenue > 0
      ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : monthlyRevenue > 0
        ? 100
        : 0;

  const activeSubscriptions = allSubscriptions.length;

  // Recent transactions (formatted for the dashboard)
  const recentSubscriptions = await subscriptionRepo.find({
    where: envFilter ? { environment: envFilter } : {},
    relations: ["plan", "user"],
    order: { createdAt: "DESC" },
    take: 10,
  });

  const recentTransactions = recentSubscriptions.map((sub) => ({
    id: sub.id,
    userName: sub.user?.email?.split("@")[0] || "Unknown",
    userEmail: sub.user?.email || "Unknown",
    planName: sub.plan?.name || "N/A",
    amount: Number(sub.amountPaid) || 0,
    date: sub.createdAt.toISOString(),
    status: paymentStatus(sub.status),
  }));

  return {
    totalRevenue,
    monthlyRevenue,
    premiumUsers,
    freeUsers,
    totalUsers,
    premiumPercentage,
    activeSubscriptions,
    revenueGrowth,
    recentTransactions,
  };
}

// ============ SUBSCRIPTIONS ============

export async function getAllSubscriptions(page = 1, limit = 20, environment?: string) {
  const envFilter = parseEnvironment(environment);
  const [subscriptions, total] = await (await repo(Subscription)).findAndCount({
    where: envFilter ? { environment: envFilter } : {},
    relations: ["plan", "user"],
    order: { createdAt: "DESC" },
    skip: (page - 1) * limit,
    take: limit,
  });
  // The NestJS API sent each user whole, password hash included.
  return {
    subscriptions: subscriptions.map((sub) => ({ ...sub, user: sub.user ? publicUser(sub.user) : sub.user })),
    total,
  };
}

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  return (await repo(Subscription)).findOne({
    where: { userId, status: SubscriptionStatus.ACTIVE, endDate: MoreThan(new Date()) },
    relations: ["plan"],
    order: { createdAt: "DESC" },
  });
}

export async function getUserSubscriptionHistory(userId: string): Promise<Subscription[]> {
  return (await repo(Subscription)).find({
    where: { userId },
    relations: ["plan"],
    order: { createdAt: "DESC" },
  });
}

/** A user's subscriptions, formatted as payments. */
export async function getUserPayments(userId: string, environment?: string) {
  const envFilter = parseEnvironment(environment);
  const subscriptions = await (await repo(Subscription)).find({
    where: { userId, ...(envFilter ? { environment: envFilter } : {}) },
    relations: ["plan"],
    order: { createdAt: "DESC" },
  });

  return subscriptions.map((sub) => ({
    id: sub.id,
    subscription: { plan: sub.plan ? { name: sub.plan.name } : null },
    amount: Number(sub.amountPaid || 0),
    currency: "EUR",
    status: paymentStatus(sub.status),
    stripePaymentIntentId: sub.stripePaymentIntentId,
    paidAt: sub.startDate,
    createdAt: sub.createdAt,
  }));
}

/** Every subscription, formatted as payments for the admin. */
export async function getAllPayments(page = 1, limit = 20, environment?: string) {
  const envFilter = parseEnvironment(environment);
  const [subscriptions, total] = await (await repo(Subscription)).findAndCount({
    where: envFilter ? { environment: envFilter } : {},
    relations: ["plan", "user"],
    order: { createdAt: "DESC" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const payments = subscriptions.map((sub) => ({
    id: sub.id,
    userId: sub.userId,
    user: sub.user ? { email: sub.user.email } : null,
    subscriptionId: sub.id,
    subscription: { plan: sub.plan ? { name: sub.plan.name } : null },
    amount: Number(sub.amountPaid || 0),
    currency: "EUR",
    status: paymentStatus(sub.status),
    stripePaymentIntentId: sub.stripePaymentIntentId,
    paidAt: sub.startDate,
    createdAt: sub.createdAt,
  }));

  return { payments, total };
}

// ============ STRIPE ============

async function checkoutPreconditions(userId: string, planId: string | undefined) {
  const user = await (await repo(User)).findOne({ where: { id: userId } });
  if (!user) throw notFound("User not found");

  const plan = await findPlanById(planId);
  if (!plan.isActive) throw badRequest("This plan is not available");

  if (await getUserSubscription(userId)) {
    throw badRequest("User already has an active subscription");
  }
  return { user, plan };
}

export async function createPaymentIntent(
  userId: string,
  planId: string | undefined,
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const { user, plan } = await checkoutPreconditions(userId, planId);

  const paymentIntent = await requireStripe().paymentIntents.create({
    amount: Math.round(Number(plan.price) * 100), // cents
    currency: "eur",
    metadata: { userId, planId: plan.id, userEmail: user.email },
    automatic_payment_methods: { enabled: true },
  });

  return { clientSecret: paymentIntent.client_secret!, paymentIntentId: paymentIntent.id };
}

/** A Stripe Checkout session, for the mobile WebView / browser flow. */
export async function createCheckoutSession(
  userId: string,
  planId: string | undefined,
  successUrl: string,
  cancelUrl: string,
): Promise<{ checkoutUrl: string; sessionId: string }> {
  const { user, plan } = await checkoutPreconditions(userId, planId);

  const session = await requireStripe().checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: plan.name,
            description: plan.description || `Abonnement ${plan.durationMonths} mois`,
          },
          unit_amount: Math.round(Number(plan.price) * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { userId, planId: plan.id, userEmail: user.email },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return { checkoutUrl: session.url!, sessionId: session.id };
}

/** Called after a successful Stripe payment (webhook). */
export async function activateSubscription(
  userId: string,
  planId: string,
  stripePaymentIntentId: string,
  amountPaid: number,
): Promise<Subscription> {
  const userRepo = await repo(User);
  const subscriptionRepo = await repo(Subscription);

  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) throw notFound("User not found");

  const plan = await findPlanById(planId);
  const now = new Date();
  const endDate = addMonths(now, plan.durationMonths);

  const saved = await subscriptionRepo.save(
    subscriptionRepo.create({
      userId,
      planId: plan.id,
      status: SubscriptionStatus.ACTIVE,
      startDate: now,
      endDate,
      stripePaymentIntentId,
      amountPaid,
      // Stripe live keys (sk_live_) produce PRODUCTION rows; sk_test_ → SANDBOX.
      environment: stripeIsLive() ? SubscriptionEnvironment.PRODUCTION : SubscriptionEnvironment.SANDBOX,
    }),
  );

  user.isSubscribed = true;
  user.subscriptionEndDate = endDate;
  await userRepo.save(user);

  return (await subscriptionRepo.findOne({ where: { id: saved.id }, relations: ["plan"] })) as Subscription;
}

export async function cancelSubscription(userId: string): Promise<Subscription> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) throw notFound("No active subscription found");

  subscription.status = SubscriptionStatus.CANCELLED;
  const saved = await (await repo(Subscription)).save(subscription);

  const userRepo = await repo(User);
  const user = await userRepo.findOne({ where: { id: userId } });
  if (user) {
    user.isSubscribed = false;
    await userRepo.save(user);
  }

  return saved;
}

export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  console.log(`[stripe] webhook received: ${event.type}`);

  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object);
      break;
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event.data.object);
      break;
    case "payment_intent.payment_failed":
      console.log("[stripe] payment failed:", event.data.object.id);
      break;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const { userId, planId } = paymentIntent.metadata;
  if (!userId || !planId) {
    console.log("[stripe] missing metadata in payment intent");
    return;
  }

  // Stripe retries deliveries: one subscription per payment.
  const existing = await (await repo(Subscription)).findOne({ where: { stripePaymentIntentId: paymentIntent.id } });
  if (existing) {
    console.log("[stripe] subscription already exists for this payment");
    return;
  }

  await activateSubscription(userId, planId, paymentIntent.id, paymentIntent.amount / 100);
  console.log(`[stripe] subscription activated for user ${userId}`);
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const { userId, planId } = session.metadata || {};
  if (!userId || !planId) {
    console.log("[stripe] missing metadata in checkout session");
    return;
  }

  const existing = await (await repo(Subscription)).findOne({ where: { stripePaymentIntentId: session.id } });
  if (existing) {
    console.log("[stripe] subscription already exists for this checkout session");
    return;
  }

  await activateSubscription(userId, planId, session.id, (session.amount_total || 0) / 100);
  console.log(`[stripe] subscription activated for user ${userId} via checkout`);
}

// ============ PROMO CODES ============

/** Grants premium for the promo code's duration; one promo code per account. */
export async function applyPromoCode(userId: string, promoCode: PromoCode): Promise<void> {
  const userRepo = await repo(User);
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) throw notFound("User not found");

  if (user.usedPromoCode) {
    throw badRequest("You have already used a promo code. Only one promo code per account.");
  }

  if (isPremium(user)) {
    throw badRequest(
      "You already have an active subscription. Promo codes cannot be applied to existing subscriptions.",
    );
  }

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + promoCode.durationDays);

  user.isSubscribed = true;
  user.subscriptionEndDate = endDate;
  user.usedPromoCode = promoCode.code;
  await userRepo.save(user);

  await incrementPromoCodeUsage(promoCode.code);

  console.log(
    `[promo] ${promoCode.code} applied to user ${userId} - ${promoCode.durationDays} days of premium access`,
  );
}

// ============ ADMIN ============

async function verifyPassword(userId: string, password: string | undefined): Promise<boolean> {
  const user = await (await repo(User)).findOne({ where: { id: userId }, select: ["id", "password"] });
  if (!user?.password || !password) return false;
  return bcrypt.compare(password, user.password);
}

/** Lets an admin grant a subscription by hand, after re-entering their password. */
export async function assignSubscriptionToUser(
  userId: string,
  planId: string | undefined,
  adminId: string,
  adminPassword: string | undefined,
): Promise<Subscription> {
  if (!(await verifyPassword(adminId, adminPassword))) {
    throw unauthorized("Invalid admin password");
  }

  const userRepo = await repo(User);
  const subscriptionRepo = await repo(Subscription);

  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) throw notFound("User not found");

  const plan = await findPlanById(planId);
  const now = new Date();
  const endDate = addMonths(now, plan.durationMonths);

  const saved = await subscriptionRepo.save(
    subscriptionRepo.create({
      userId,
      planId: plan.id,
      status: SubscriptionStatus.ACTIVE,
      startDate: now,
      endDate,
      stripePaymentIntentId: `admin_${adminId}_${Date.now()}`,
      amountPaid: 0, // admin assigned = free
      environment: SubscriptionEnvironment.PRODUCTION,
    }),
  );

  user.isSubscribed = true;
  user.subscriptionEndDate = endDate;
  await userRepo.save(user);

  console.log(`[subscriptions] admin ${adminId} assigned ${plan.name} to user ${userId}`);
  return saved;
}

// ============ SCHEDULED ============

/**
 * What the NestJS midnight cron did: mark every ACTIVE subscription whose end
 * date has passed as EXPIRED, and take the premium flag off its user unless
 * another subscription is still running.
 *
 * Like the cron, it leaves `subscriptionEndDate` in place (the NestJS update
 * passed `undefined`, which TypeORM skips). Premium checks go through
 * `isPremium()`, which already ignores a past end date, so this job only
 * tidies the data the admin reads.
 */
export async function expireSubscriptions(): Promise<{ expired: number }> {
  const subscriptionRepo = await repo(Subscription);
  const userRepo = await repo(User);
  const now = new Date();

  const expiredSubscriptions = await subscriptionRepo.find({
    where: { status: SubscriptionStatus.ACTIVE, endDate: LessThanOrEqual(now) },
  });

  let expired = 0;
  for (const subscription of expiredSubscriptions) {
    try {
      subscription.status = SubscriptionStatus.EXPIRED;
      await subscriptionRepo.save(subscription);
      expired++;

      const stillActive = await subscriptionRepo.findOne({
        where: { userId: subscription.userId, status: SubscriptionStatus.ACTIVE, endDate: MoreThan(now) },
      });
      if (!stillActive) {
        await userRepo.update(subscription.userId, { isSubscribed: false });
      }
    } catch (error) {
      // One bad row must not stop the rest of the run, as in the cron.
      console.error(`[subscriptions] error expiring subscription ${subscription.id}`, error);
    }
  }

  console.log(`[subscriptions] ${expired} subscriptions marked as EXPIRED`);
  return { expired };
}
