import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Headers,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  CreateSubscriptionDto,
  UpdateConfigDto,
} from './dto';
import Stripe from 'stripe';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
    email: string;
    isAdmin: boolean;
  };
}

@Controller('subscriptions')
export class SubscriptionsController {
  private stripe: Stripe;

  constructor(private readonly subscriptionsService: SubscriptionsService) {
    const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
    this.stripe = new Stripe(stripeKey);
  }

  // ============ PUBLIC ROUTES ============

  @Get('plans')
  async getPlans(@Query('activeOnly') activeOnly?: string) {
    return this.subscriptionsService.findAllPlans(activeOnly === 'true');
  }

  @Get('plans/:id')
  async getPlan(@Param('id') id: string) {
    return this.subscriptionsService.findPlanById(id);
  }

  @Get('config')
  async getConfig() {
    return this.subscriptionsService.getConfig();
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats(@Request() req: AuthenticatedRequest) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Only admins can view subscription stats');
    }
    return this.subscriptionsService.getStats();
  }

  // ============ USER ROUTES ============

  @UseGuards(JwtAuthGuard)
  @Get('my-subscription')
  async getMySubscription(@Request() req: AuthenticatedRequest) {
    return this.subscriptionsService.getUserSubscription(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-subscription/history')
  async getMySubscriptionHistory(@Request() req: AuthenticatedRequest) {
    return this.subscriptionsService.getUserSubscriptionHistory(
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-payments')
  async getMyPayments(@Request() req: AuthenticatedRequest) {
    return this.subscriptionsService.getUserPayments(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribe(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.createSubscription(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('start-trial')
  async startTrial(@Request() req: AuthenticatedRequest) {
    return this.subscriptionsService.startFreeTrial(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cancel')
  async cancelSubscription(@Request() req: AuthenticatedRequest) {
    return this.subscriptionsService.cancelSubscription(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckoutSession(
    @Request() req: AuthenticatedRequest,
    @Body('planId') planId: string,
  ) {
    return this.subscriptionsService.createStripeCheckoutSession(
      req.user.userId,
      planId,
    );
  }

  // ============ ADMIN ROUTES ============

  @UseGuards(JwtAuthGuard)
  @Post('plans')
  async createPlan(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateSubscriptionPlanDto,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Only admins can create plans');
    }
    return this.subscriptionsService.createPlan(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('plans/:id')
  async updatePlan(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionPlanDto,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Only admins can update plans');
    }
    return this.subscriptionsService.updatePlan(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('plans/:id')
  async deletePlan(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Only admins can delete plans');
    }
    return this.subscriptionsService.deletePlan(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('config')
  async updateConfig(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateConfigDto,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Only admins can update config');
    }
    return this.subscriptionsService.updateConfig(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('payments')
  async getAllPayments(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Only admins can view all payments');
    }
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.subscriptionsService.getAllPayments(pageNum, limitNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:userId/subscription')
  async getUserSubscription(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Only admins can view user subscriptions');
    }
    return this.subscriptionsService.getUserSubscription(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:userId/subscription/history')
  async getUserSubscriptionHistory(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException(
        'Only admins can view user subscription history',
      );
    }
    return this.subscriptionsService.getUserSubscriptionHistory(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:userId/payments')
  async getUserPayments(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Only admins can view user payments');
    }
    return this.subscriptionsService.getUserPayments(userId);
  }

  // ============ STRIPE WEBHOOK ============

  @Post('webhook')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<ExpressRequest>,
  ) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return { received: false };
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        req.rawBody!,
        signature,
        webhookSecret,
      );

      await this.subscriptionsService.handleStripeWebhook(event);
      return { received: true };
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return { received: false, error: err.message };
    }
  }
}
