import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Between } from 'typeorm';
import Stripe from 'stripe';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionEnvironment,
} from './entities/subscription.entity';
import {
  AppConfig,
  CONFIG_KEYS,
  DEFAULT_CONFIG,
} from './entities/app-config.entity';
import { User } from '../users/entities/user.entity';
import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  UpdateConfigDto,
} from './dto';
import { AuthService } from '../auth/auth.service';
import { PromoCodeService } from './promo-code.service';

// Entitlement identifier configured in RevenueCat dashboard
const ENTITLEMENT_ID = 'Focus Pro';

interface RevenueCatEventBody {
  type?: string;
  app_user_id?: string;
  entitlement_ids?: string[];
  expiration_at_ms?: number;
  id?: string;
  price?: number;
  // RevenueCat sends 'SANDBOX' for App Store sandbox / Play test track,
  // 'PRODUCTION' for real customers
  environment?: 'SANDBOX' | 'PRODUCTION';
}

interface RevenueCatWebhookPayload {
  event?: RevenueCatEventBody;
}

@Injectable()
export class SubscriptionsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(SubscriptionPlan)
    private planRepository: Repository<SubscriptionPlan>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(AppConfig)
    private configRepository: Repository<AppConfig>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    @Inject(forwardRef(() => PromoCodeService))
    private promoCodeService: PromoCodeService,
  ) {
    const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
    this.stripe = new Stripe(stripeKey);
  }

  // ============ STATISTICS ============

  /**
   * Normalize the ?environment query string into a value the where-clause can
   * consume. Returns undefined when the caller asked for everything (or sent
   * an unrecognized value) so callers can spread it into `where`.
   */
  private parseEnvironment(raw?: string): SubscriptionEnvironment | undefined {
    if (!raw) return undefined;
    const upper = raw.toUpperCase();
    if (upper === 'PRODUCTION') return SubscriptionEnvironment.PRODUCTION;
    if (upper === 'SANDBOX') return SubscriptionEnvironment.SANDBOX;
    return undefined;
  }

  async getStats(environment?: string): Promise<{
    totalRevenue: number;
    monthlyRevenue: number;
    premiumUsers: number;
    freeUsers: number;
    totalUsers: number;
    premiumPercentage: number;
    activeSubscriptions: number;
    revenueGrowth: number;
    recentTransactions: Array<{
      id: string;
      userName: string;
      userEmail: string;
      planName: string;
      amount: number;
      date: string;
      status: string;
    }>;
  }> {
    const envFilter = this.parseEnvironment(environment);

    // Premium/free counts are user-level (no environment column on user), so
    // they stay accurate across both modes. Only revenue + transaction lists
    // are scoped by environment.
    const totalUsers = await this.userRepository.count();
    const premiumUsers = await this.userRepository.count({
      where: { isSubscribed: true },
    });
    const freeUsers = totalUsers - premiumUsers;
    const premiumPercentage =
      totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0;

    // Get all subscriptions for revenue calculation (scoped by environment)
    const allSubscriptions = await this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        ...(envFilter ? { environment: envFilter } : {}),
      },
      relations: ['plan'],
    });

    const totalRevenue = allSubscriptions.reduce(
      (sum, sub) => sum + Number(sub.amountPaid || 0),
      0,
    );

    // Monthly revenue (subscriptions created this month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlySubscriptions = allSubscriptions.filter(
      (sub) => new Date(sub.createdAt) >= startOfMonth,
    );
    const monthlyRevenue = monthlySubscriptions.reduce(
      (sum, sub) => sum + Number(sub.amountPaid || 0),
      0,
    );

    // Calculate revenue growth (compare to last month)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthSubscriptions = await this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        createdAt: Between(startOfLastMonth, endOfLastMonth),
        ...(envFilter ? { environment: envFilter } : {}),
      },
    });
    const lastMonthRevenue = lastMonthSubscriptions.reduce(
      (sum, sub) => sum + Number(sub.amountPaid || 0),
      0,
    );
    const revenueGrowth =
      lastMonthRevenue > 0
        ? Math.round(
            ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100,
          )
        : monthlyRevenue > 0
          ? 100
          : 0;

    const activeSubscriptions = allSubscriptions.length;

    // Recent transactions (formatted for dashboard)
    const recentSubscriptions = await this.subscriptionRepository.find({
      where: envFilter ? { environment: envFilter } : {},
      relations: ['plan', 'user'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const recentTransactions = recentSubscriptions.map((sub) => ({
      id: sub.id,
      userName: sub.user?.email?.split('@')[0] || 'Unknown',
      userEmail: sub.user?.email || 'Unknown',
      planName: sub.plan?.name || 'N/A',
      amount: Number(sub.amountPaid) || 0,
      date: sub.createdAt.toISOString(),
      status:
        sub.status === SubscriptionStatus.ACTIVE ? 'SUCCEEDED' : sub.status,
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

  // ============ CONFIG ============

  async getConfig(): Promise<Record<string, string>> {
    const configs = await this.configRepository.find();
    const configMap: Record<string, string> = { ...DEFAULT_CONFIG };
    configs.forEach((config) => {
      configMap[config.key] = config.value;
    });
    return configMap;
  }

  async updateConfig(dto: UpdateConfigDto): Promise<Record<string, string>> {
    const updates: { key: string; value: string }[] = [];

    if (dto.freemiumDurationDays !== undefined) {
      updates.push({
        key: CONFIG_KEYS.FREEMIUM_DURATION_DAYS,
        value: String(dto.freemiumDurationDays),
      });
    }

    for (const update of updates) {
      let config = await this.configRepository.findOne({
        where: { key: update.key },
      });
      if (config) {
        config.value = update.value;
      } else {
        config = this.configRepository.create(update);
      }
      await this.configRepository.save(config);
    }

    return this.getConfig();
  }

  // ============ SUBSCRIPTION PLANS ============

  async createPlan(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    const plan = this.planRepository.create({
      ...dto,
      durationMonths: dto.durationMonths || 1,
    });
    return this.planRepository.save(plan);
  }

  async findAllPlans(activeOnly = false): Promise<SubscriptionPlan[]> {
    const where = activeOnly ? { isActive: true } : {};
    return this.planRepository.find({ where, order: { price: 'ASC' } });
  }

  async findPlanById(id: string): Promise<SubscriptionPlan> {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }
    return plan;
  }

  async updatePlan(
    id: string,
    dto: UpdateSubscriptionPlanDto,
  ): Promise<SubscriptionPlan> {
    const plan = await this.findPlanById(id);
    Object.assign(plan, dto);
    return this.planRepository.save(plan);
  }

  async deletePlan(id: string): Promise<void> {
    const plan = await this.findPlanById(id);
    await this.planRepository.softDelete(plan.id);
  }

  // ============ SUBSCRIPTIONS ============

  async getAllSubscriptions(
    page = 1,
    limit = 20,
    environment?: string,
  ): Promise<{ subscriptions: Subscription[]; total: number }> {
    const envFilter = this.parseEnvironment(environment);
    const [subscriptions, total] =
      await this.subscriptionRepository.findAndCount({
        where: envFilter ? { environment: envFilter } : {},
        relations: ['plan', 'user'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });
    return { subscriptions, total };
  }

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    const now = new Date();
    return this.subscriptionRepository.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: MoreThan(now),
      },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserSubscriptionHistory(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { userId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  // Get user payments (subscriptions formatted as payments)
  async getUserPayments(userId: string, environment?: string): Promise<any[]> {
    const envFilter = this.parseEnvironment(environment);
    const subscriptions = await this.subscriptionRepository.find({
      where: {
        userId,
        ...(envFilter ? { environment: envFilter } : {}),
      },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });

    // Format subscriptions as payments
    return subscriptions.map((sub) => ({
      id: sub.id,
      subscription: {
        plan: sub.plan ? { name: sub.plan.name } : null,
      },
      amount: Number(sub.amountPaid || 0),
      currency: 'EUR',
      status:
        sub.status === SubscriptionStatus.ACTIVE ? 'SUCCEEDED' : sub.status,
      stripePaymentIntentId: sub.stripePaymentIntentId,
      paidAt: sub.startDate,
      createdAt: sub.createdAt,
    }));
  }

  // Get total amount spent by user
  async getUserTotalSpent(userId: string): Promise<number> {
    const subscriptions = await this.subscriptionRepository.find({
      where: { userId },
    });

    return subscriptions.reduce(
      (total, sub) => total + Number(sub.amountPaid || 0),
      0,
    );
  }

  // Get all payments (subscriptions formatted as payments for admin)
  async getAllPayments(
    page = 1,
    limit = 20,
    environment?: string,
  ): Promise<{ payments: any[]; total: number }> {
    const envFilter = this.parseEnvironment(environment);
    const [subscriptions, total] =
      await this.subscriptionRepository.findAndCount({
        where: envFilter ? { environment: envFilter } : {},
        relations: ['plan', 'user'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

    // Format subscriptions as payments
    const payments = subscriptions.map((sub) => ({
      id: sub.id,
      userId: sub.userId,
      user: sub.user ? { email: sub.user.email } : null,
      subscriptionId: sub.id,
      subscription: {
        plan: sub.plan ? { name: sub.plan.name } : null,
      },
      amount: Number(sub.amountPaid || 0),
      currency: 'EUR',
      status:
        sub.status === SubscriptionStatus.ACTIVE ? 'SUCCEEDED' : sub.status,
      stripePaymentIntentId: sub.stripePaymentIntentId,
      paidAt: sub.startDate,
      createdAt: sub.createdAt,
    }));

    return { payments, total };
  }

  // ============ STRIPE PAYMENT INTENT (Simple) ============

  async createPaymentIntent(
    userId: string,
    planId: string,
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plan = await this.findPlanById(planId);
    if (!plan.isActive) {
      throw new BadRequestException('This plan is not available');
    }

    // Check if user already has an active subscription
    const existingSubscription = await this.getUserSubscription(userId);
    if (existingSubscription) {
      throw new BadRequestException('User already has an active subscription');
    }

    // Create Payment Intent (amount in cents)
    const amountInCents = Math.round(Number(plan.price) * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      metadata: {
        userId,
        planId,
        userEmail: user.email,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  }

  // ============ STRIPE CHECKOUT SESSION (for WebView/Browser) ============

  async createCheckoutSession(
    userId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ checkoutUrl: string; sessionId: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plan = await this.findPlanById(planId);
    if (!plan.isActive) {
      throw new BadRequestException('This plan is not available');
    }

    // Check if user already has an active subscription
    const existingSubscription = await this.getUserSubscription(userId);
    if (existingSubscription) {
      throw new BadRequestException('User already has an active subscription');
    }

    // Create Checkout Session
    const amountInCents = Math.round(Number(plan.price) * 100);

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: plan.name,
              description:
                plan.description || `Abonnement ${plan.durationMonths} mois`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        planId,
        userEmail: user.email,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return {
      checkoutUrl: session.url!,
      sessionId: session.id,
    };
  }

  // Called after successful payment (via webhook or manual confirmation)
  async activateSubscription(
    userId: string,
    planId: string,
    stripePaymentIntentId: string,
    amountPaid: number,
  ): Promise<Subscription> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plan = await this.findPlanById(planId);

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    // Stripe live keys (sk_live_) produce PRODUCTION rows; sk_test_ → SANDBOX.
    const stripeKey = process.env.STRIPE_SECRET_KEY || '';
    const environment = stripeKey.startsWith('sk_live_')
      ? SubscriptionEnvironment.PRODUCTION
      : SubscriptionEnvironment.SANDBOX;

    const subscription = this.subscriptionRepository.create({
      userId,
      planId: plan.id,
      status: SubscriptionStatus.ACTIVE,
      startDate: now,
      endDate,
      stripePaymentIntentId,
      amountPaid,
      environment,
    });

    const savedSubscription =
      await this.subscriptionRepository.save(subscription);

    // Update user subscription status
    user.isSubscribed = true;
    user.subscriptionEndDate = endDate;
    await this.userRepository.save(user);

    return this.subscriptionRepository.findOne({
      where: { id: savedSubscription.id },
      relations: ['plan'],
    }) as Promise<Subscription>;
  }

  async cancelSubscription(userId: string): Promise<Subscription> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    const savedSubscription =
      await this.subscriptionRepository.save(subscription);

    // Update user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.isSubscribed = false;
      await this.userRepository.save(user);
    }

    return savedSubscription;
  }

  // ============ STRIPE WEBHOOK ============

  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    console.log(`📥 Stripe webhook received: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case 'payment_intent.payment_failed':
        console.log('❌ Payment failed:', event.data.object);
        break;
    }
  }

  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    const { userId, planId } = paymentIntent.metadata;

    if (!userId || !planId) {
      console.log('⚠️ Missing metadata in payment intent');
      return;
    }

    // Check if subscription already exists for this payment
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (existingSubscription) {
      console.log('ℹ️ Subscription already exists for this payment');
      return;
    }

    const amountPaid = paymentIntent.amount / 100; // Convert from cents

    await this.activateSubscription(
      userId,
      planId,
      paymentIntent.id,
      amountPaid,
    );
    console.log(`✅ Subscription activated for user ${userId}`);
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const { userId, planId } = session.metadata || {};

    if (!userId || !planId) {
      console.log('⚠️ Missing metadata in checkout session');
      return;
    }

    // Check if subscription already exists for this session
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { stripePaymentIntentId: session.id },
    });

    if (existingSubscription) {
      console.log('ℹ️ Subscription already exists for this checkout session');
      return;
    }

    const amountPaid = (session.amount_total || 0) / 100; // Convert from cents

    await this.activateSubscription(userId, planId, session.id, amountPaid);
    console.log(`✅ Subscription activated for user ${userId} via checkout`);
  }

  // ============ REVENUECAT INTEGRATION ============

  async handleRevenueCatWebhook(
    payload: RevenueCatWebhookPayload,
  ): Promise<void> {
    const event = payload.event ?? {};
    console.log('📱 RevenueCat webhook received:', event.type);

    const eventType = event.type;
    const appUserId = event.app_user_id;
    const entitlements = event.entitlement_ids ?? [];

    if (!appUserId) {
      console.log('⚠️ No app_user_id in RevenueCat event');
      return;
    }

    switch (eventType) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'PRODUCT_CHANGE':
        await this.activateRevenueCatSubscription(
          appUserId,
          entitlements,
          event,
        );
        break;
      case 'CANCELLATION':
      case 'EXPIRATION':
        await this.deactivateRevenueCatSubscription(appUserId);
        break;
      default:
        console.log(`ℹ️ Unhandled RevenueCat event type: ${eventType}`);
    }
  }

  async activateRevenueCatSubscription(
    userId: string,
    entitlements: string[],
    event: RevenueCatEventBody,
  ): Promise<void> {
    // Find the user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      console.log(`⚠️ User ${userId} not found for RevenueCat subscription`);
      return;
    }

    // Only activate when the configured entitlement is granted
    if (entitlements.length > 0 && !entitlements.includes(ENTITLEMENT_ID)) {
      console.log(
        `ℹ️ Event ignored: entitlement "${ENTITLEMENT_ID}" not in [${entitlements.join(', ')}]`,
      );
      return;
    }

    // Compute expiration date
    const expirationDate = event.expiration_at_ms
      ? new Date(event.expiration_at_ms)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

    // Mark user as subscribed (premium = isSubscribed + subscriptionEndDate > now)
    user.isSubscribed = true;
    user.subscriptionEndDate = expirationDate;
    await this.userRepository.save(user);

    // Get or create a default premium plan for RevenueCat subscriptions
    // Backward compatibility: also match the legacy name "RevenueCat Premium"
    let plan = await this.planRepository.findOne({
      where: [{ name: 'Premium' }, { name: 'RevenueCat Premium' }],
    });

    if (!plan) {
      plan = this.planRepository.create({
        name: 'Premium',
        description: 'Premium subscription via App Store / Google Play',
        price: 0, // Price managed by stores
        durationMonths: 1,
        isActive: true,
      });
      await this.planRepository.save(plan);
    } else if (plan.name === 'RevenueCat Premium') {
      // Migrate legacy plan name in-place
      plan.name = 'Premium';
      await this.planRepository.save(plan);
    }

    const environment =
      event.environment === 'SANDBOX'
        ? SubscriptionEnvironment.SANDBOX
        : SubscriptionEnvironment.PRODUCTION;

    const subscription = this.subscriptionRepository.create({
      user,
      plan,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate: expirationDate,
      stripePaymentIntentId: `rc_${event.id ?? Date.now()}`,
      // Sandbox events should not pollute real revenue: keep the price RC
      // reports but flag the row so admin filters can hide it.
      amountPaid: event.price ?? 0,
      environment,
    });

    await this.subscriptionRepository.save(subscription);
    console.log(`✅ RevenueCat subscription activated for user ${userId}`);
  }

  async deactivateRevenueCatSubscription(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return;

    user.isSubscribed = false;
    await this.userRepository.save(user);

    // Mark active subscriptions as cancelled
    const activeSubscriptions = await this.subscriptionRepository.find({
      where: { user: { id: userId }, status: SubscriptionStatus.ACTIVE },
    });

    for (const subscription of activeSubscriptions) {
      subscription.status = SubscriptionStatus.CANCELLED;
      await this.subscriptionRepository.save(subscription);
    }

    console.log(`✅ RevenueCat subscription deactivated for user ${userId}`);
  }

  async syncRevenueCatEntitlements(
    userId: string,
    revenueCatUserId: string,
    entitlements: string[],
  ): Promise<{ synced: boolean; isPremium: boolean }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hasPremium = entitlements.includes(ENTITLEMENT_ID);

    if (user.isSubscribed !== hasPremium) {
      user.isSubscribed = hasPremium;
      if (hasPremium && !user.subscriptionEndDate) {
        // Default to 30 days if no end date is set yet
        user.subscriptionEndDate = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        );
      }
      await this.userRepository.save(user);
      console.log(
        `✅ User ${userId} (rc: ${revenueCatUserId}) premium synced: ${hasPremium}`,
      );
    }

    return { synced: true, isPremium: hasPremium };
  }

  /**
   * Apply a promo code to a user to grant them premium access
   */
  async applyPromoCode(userId: string, promoCode: any): Promise<void> {
    // Find user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already used a promo code
    if (user.usedPromoCode) {
      throw new BadRequestException(
        'You have already used a promo code. Only one promo code per account.',
      );
    }

    // Check if user already has an active subscription
    if (user.isSubscribed && user.subscriptionEndDate) {
      const now = new Date();
      if (new Date(user.subscriptionEndDate) > now) {
        throw new BadRequestException(
          'You already have an active subscription. Promo codes cannot be applied to existing subscriptions.',
        );
      }
    }

    // Calculate end date based on promo code duration
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + promoCode.durationDays);

    // Update user premium status and mark promo code as used
    user.isSubscribed = true;
    user.subscriptionEndDate = endDate;
    user.usedPromoCode = promoCode.code;
    await this.userRepository.save(user);

    // Increment promo code usage count
    await this.promoCodeService.incrementUsageCount(promoCode.code);

    console.log(
      `✅ Promo code ${promoCode.code} applied to user ${userId} - ${promoCode.durationDays} days of premium access`,
    );
  }

  /**
   * Permet à un admin d'attribuer manuellement une souscription à un utilisateur
   */
  async assignSubscriptionToUser(
    userId: string,
    planId: string,
    adminId: string,
    adminPassword: string,
  ): Promise<Subscription> {
    // Verify admin password
    const isValidPassword = await this.authService.verifyPassword(
      adminId,
      adminPassword,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid admin password');
    }

    // Find user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find plan
    const plan = await this.findPlanById(planId);

    // Calculate end date
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    // Create subscription
    const subscription = this.subscriptionRepository.create({
      userId,
      planId: plan.id,
      status: SubscriptionStatus.ACTIVE,
      startDate: now,
      endDate,
      stripePaymentIntentId: `admin_${adminId}_${Date.now()}`,
      amountPaid: 0, // Admin assigned = free
      environment: SubscriptionEnvironment.PRODUCTION,
    });

    const savedSubscription =
      await this.subscriptionRepository.save(subscription);

    // Update user premium status
    user.isSubscribed = true;
    user.subscriptionEndDate = endDate;
    await this.userRepository.save(user);

    console.log(
      `✅ Admin ${adminId} assigned subscription ${plan.name} to user ${userId}`,
    );

    return savedSubscription;
  }
}
