import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import Stripe from 'stripe';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import {
  Subscription,
  SubscriptionStatus,
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
  ) {
    const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
    this.stripe = new Stripe(stripeKey);
  }

  // ============ STATISTICS ============

  async getStats(): Promise<{
    totalRevenue: number;
    monthlyRevenue: number;
    premiumUsers: number;
    freeUsers: number;
    totalUsers: number;
    premiumPercentage: number;
    activeSubscriptions: number;
    recentSubscriptions: Subscription[];
  }> {
    const totalUsers = await this.userRepository.count();
    const premiumUsers = await this.userRepository.count({
      where: { isSubscribed: true },
    });
    const freeUsers = totalUsers - premiumUsers;
    const premiumPercentage =
      totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0;

    // Get all subscriptions for revenue calculation
    const allSubscriptions = await this.subscriptionRepository.find({
      where: { status: SubscriptionStatus.ACTIVE },
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

    const activeSubscriptions = allSubscriptions.length;

    // Recent subscriptions
    const recentSubscriptions = await this.subscriptionRepository.find({
      relations: ['plan', 'user'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      totalRevenue,
      monthlyRevenue,
      premiumUsers,
      freeUsers,
      totalUsers,
      premiumPercentage,
      activeSubscriptions,
      recentSubscriptions,
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
  ): Promise<{ subscriptions: Subscription[]; total: number }> {
    const [subscriptions, total] =
      await this.subscriptionRepository.findAndCount({
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

    const subscription = this.subscriptionRepository.create({
      userId,
      planId: plan.id,
      status: SubscriptionStatus.ACTIVE,
      startDate: now,
      endDate,
      stripePaymentIntentId,
      amountPaid,
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
}
