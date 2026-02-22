import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import {
  SubscriptionPlan,
  PlanType,
} from './entities/subscription-plan.entity';
import {
  Subscription,
  SubscriptionStatus,
} from './entities/subscription.entity';
import { Payment, PaymentStatus } from './entities/payment.entity';
import {
  AppConfig,
  CONFIG_KEYS,
  DEFAULT_CONFIG,
} from './entities/app-config.entity';
import { User } from '../users/entities/user.entity';
import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  CreateSubscriptionDto,
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
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(AppConfig)
    private configRepository: Repository<AppConfig>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    // Initialize Stripe with secret key from env
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
    revenueGrowth: number;
    recentTransactions: Array<{
      id: string;
      userName: string;
      userEmail: string;
      planName: string;
      amount: number;
      date: Date;
      status: string;
    }>;
  }> {
    // Get user counts
    const totalUsers = await this.userRepository.count();
    const premiumUsers = await this.userRepository.count({
      where: { isSubscribed: true },
    });
    const freeUsers = totalUsers - premiumUsers;
    const premiumPercentage =
      totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0;

    // Get total revenue (all successful payments)
    const allPayments = await this.paymentRepository.find({
      where: { status: PaymentStatus.SUCCEEDED },
    });
    const totalRevenue = allPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    // Get monthly revenue (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyPayments = allPayments.filter(
      (payment) => payment.paidAt && new Date(payment.paidAt) >= startOfMonth,
    );
    const monthlyRevenue = monthlyPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    // Get last month revenue for growth calculation
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthPayments = allPayments.filter(
      (payment) =>
        payment.paidAt &&
        new Date(payment.paidAt) >= startOfLastMonth &&
        new Date(payment.paidAt) <= endOfLastMonth,
    );
    const lastMonthRevenue = lastMonthPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    // Calculate revenue growth percentage
    const revenueGrowth =
      lastMonthRevenue > 0
        ? Math.round(
            ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100,
          )
        : monthlyRevenue > 0
          ? 100
          : 0;

    // Get recent transactions (last 10)
    const recentPayments = await this.paymentRepository.find({
      relations: ['user', 'subscription', 'subscription.plan'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const recentTransactions = recentPayments.map((payment) => ({
      id: payment.id,
      userName: payment.user?.email?.split('@')[0] || 'Unknown',
      userEmail: payment.user?.email || 'Unknown',
      planName: payment.subscription?.plan?.name || 'Premium',
      amount: payment.amount,
      date: payment.createdAt,
      status: payment.status,
    }));

    return {
      totalRevenue,
      monthlyRevenue,
      premiumUsers,
      freeUsers,
      totalUsers,
      premiumPercentage,
      revenueGrowth,
      recentTransactions,
    };
  }

  // ============ CONFIG MANAGEMENT ============

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
    if (dto.monthlyPrice !== undefined) {
      updates.push({
        key: CONFIG_KEYS.MONTHLY_PRICE,
        value: String(dto.monthlyPrice),
      });
    }
    if (dto.yearlyPrice !== undefined) {
      updates.push({
        key: CONFIG_KEYS.YEARLY_PRICE,
        value: String(dto.yearlyPrice),
      });
    }
    if (dto.yearlyDiscountPercentage !== undefined) {
      updates.push({
        key: CONFIG_KEYS.YEARLY_DISCOUNT_PERCENTAGE,
        value: String(dto.yearlyDiscountPercentage),
      });
    }
    if (dto.stripeMonthlyPriceId !== undefined) {
      updates.push({
        key: CONFIG_KEYS.STRIPE_MONTHLY_PRICE_ID,
        value: dto.stripeMonthlyPriceId,
      });
    }
    if (dto.stripeYearlyPriceId !== undefined) {
      updates.push({
        key: CONFIG_KEYS.STRIPE_YEARLY_PRICE_ID,
        value: dto.stripeYearlyPriceId,
      });
    }

    for (const update of updates) {
      let config = await this.configRepository.findOne({
        where: { key: update.key },
      });
      if (config) {
        config.value = update.value;
      } else {
        config = this.configRepository.create({
          key: update.key,
          value: update.value,
        });
      }
      await this.configRepository.save(config);
    }

    return this.getConfig();
  }

  // ============ SUBSCRIPTION PLANS ============

  async createPlan(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    const plan = this.planRepository.create({
      ...dto,
      durationMonths: dto.type === PlanType.YEARLY ? 12 : 1,
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

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
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

  async createSubscription(
    userId: string,
    dto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plan = await this.findPlanById(dto.planId);
    if (!plan.isActive) {
      throw new BadRequestException('This plan is not available');
    }

    // Check if user already has an active subscription
    const existingSubscription = await this.getUserSubscription(userId);
    if (existingSubscription) {
      throw new BadRequestException('User already has an active subscription');
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    const subscription = this.subscriptionRepository.create({
      userId,
      planId: plan.id,
      status: SubscriptionStatus.ACTIVE,
      startDate: now,
      endDate,
      autoRenew: dto.autoRenew ?? false,
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
    subscription.cancelledAt = new Date();
    subscription.autoRenew = false;

    return this.subscriptionRepository.save(subscription);
  }

  async startFreeTrial(userId: string): Promise<Subscription> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already had a trial
    const existingTrial = await this.subscriptionRepository.findOne({
      where: { userId, status: SubscriptionStatus.TRIAL },
    });
    if (existingTrial) {
      throw new BadRequestException('User already used their free trial');
    }

    const config = await this.getConfig();
    const trialDays = parseInt(config[CONFIG_KEYS.FREEMIUM_DURATION_DAYS], 10);

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + trialDays);

    const subscription = this.subscriptionRepository.create({
      userId,
      planId: null,
      status: SubscriptionStatus.TRIAL,
      startDate: now,
      endDate,
      autoRenew: false,
    });

    const savedSubscription =
      await this.subscriptionRepository.save(subscription);

    // Update user subscription status
    user.isSubscribed = true;
    user.subscriptionEndDate = endDate;
    await this.userRepository.save(user);

    return savedSubscription;
  }

  // ============ PAYMENTS ============

  async createPayment(
    userId: string,
    subscriptionId: string | null,
    amount: number,
    stripePaymentIntentId?: string,
  ): Promise<Payment> {
    const payment = this.paymentRepository.create({
      userId,
      subscriptionId: subscriptionId || undefined,
      amount,
      status: PaymentStatus.PENDING,
      stripePaymentIntentId,
    });
    return this.paymentRepository.save(payment);
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { userId },
      relations: ['subscription', 'subscription.plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllPayments(
    page = 1,
    limit = 20,
  ): Promise<{ payments: Payment[]; total: number }> {
    const [payments, total] = await this.paymentRepository.findAndCount({
      relations: ['user', 'subscription', 'subscription.plan'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { payments, total };
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    failureReason?: string,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = status;
    if (status === PaymentStatus.SUCCEEDED) {
      payment.paidAt = new Date();
    }
    if (failureReason) {
      payment.failureReason = failureReason;
    }

    return this.paymentRepository.save(payment);
  }

  // ============ STRIPE INTEGRATION ============

  async createStripeCheckoutSession(
    userId: string,
    planId: string,
  ): Promise<{ sessionId: string; url: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plan = await this.findPlanById(planId);
    if (!plan.stripePriceId) {
      throw new BadRequestException(
        'This plan is not configured for Stripe payments',
      );
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/subscription/cancel`,
      customer_email: user.email,
      metadata: {
        userId,
        planId,
      },
    });

    return { sessionId: session.id, url: session.url || '' };
  }

  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(
          event.data.object as Stripe.Invoice,
        );
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;
    }
  }

  private async handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;

    if (!userId || !planId) return;

    await this.createSubscription(userId, {
      planId,
      autoRenew: true,
    });
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    // Record successful payment
    const customerId = invoice.customer as string;
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        stripeCustomerId: customerId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (subscription) {
      // Get payment intent ID from invoice metadata or charge
      const paymentIntentId = (invoice as any).payment_intent as
        | string
        | undefined;
      await this.createPayment(
        subscription.userId,
        subscription.id,
        (invoice.amount_paid || 0) / 100,
        paymentIntentId,
      );
    }
  }

  private async handleInvoicePaymentFailed(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    const customerId = invoice.customer as string;
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeCustomerId: customerId },
    });

    if (subscription) {
      subscription.status = SubscriptionStatus.PAST_DUE;
      await this.subscriptionRepository.save(subscription);
    }
  }

  private async handleSubscriptionDeleted(
    stripeSubscription: Stripe.Subscription,
  ): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (subscription) {
      subscription.status = SubscriptionStatus.CANCELLED;
      subscription.cancelledAt = new Date();
      await this.subscriptionRepository.save(subscription);

      const user = await this.userRepository.findOne({
        where: { id: subscription.userId },
      });
      if (user) {
        user.isSubscribed = false;
        await this.userRepository.save(user);
      }
    }
  }
}
