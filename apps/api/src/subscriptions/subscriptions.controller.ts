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
  Header,
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
  @Post('create-payment-intent')
  async createPaymentIntent(
    @Request() req: AuthenticatedRequest,
    @Body('planId') planId: string,
  ) {
    return this.subscriptionsService.createPaymentIntent(
      req.user.userId,
      planId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-checkout-session')
  async createCheckoutSession(
    @Request() req: AuthenticatedRequest,
    @Body('planId') planId: string,
    @Body('successUrl') successUrl?: string,
    @Body('cancelUrl') cancelUrl?: string,
  ) {
    // Use API URL for success/cancel pages (simple HTML pages)
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const defaultSuccessUrl =
      successUrl || `${apiUrl}/subscriptions/payment-success`;
    const defaultCancelUrl =
      cancelUrl || `${apiUrl}/subscriptions/payment-cancel`;

    return this.subscriptionsService.createCheckoutSession(
      req.user.userId,
      planId,
      defaultSuccessUrl,
      defaultCancelUrl,
    );
  }

  // Simple success page for mobile checkout
  @Get('payment-success')
  @Header('Content-Type', 'text/html')
  getPaymentSuccess() {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Paiement réussi</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .card { background: white; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-width: 400px; }
            .icon { font-size: 60px; margin-bottom: 20px; }
            h1 { color: #22c55e; margin: 0 0 10px; }
            p { color: #666; margin: 0 0 20px; }
            .btn { background: #667eea; color: white; padding: 15px 30px; border: none; border-radius: 10px; font-size: 16px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✅</div>
            <h1>Paiement réussi !</h1>
            <p>Votre abonnement est maintenant actif.<br>Vous pouvez fermer cette page et retourner à l'application.</p>
            <button class="btn" onclick="window.close()">Fermer</button>
          </div>
        </body>
      </html>
    `;
  }

  // Simple cancel page for mobile checkout
  @Get('payment-cancel')
  @Header('Content-Type', 'text/html')
  getPaymentCancel() {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Paiement annulé</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .card { background: white; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-width: 400px; }
            .icon { font-size: 60px; margin-bottom: 20px; }
            h1 { color: #ef4444; margin: 0 0 10px; }
            p { color: #666; margin: 0 0 20px; }
            .btn { background: #667eea; color: white; padding: 15px 30px; border: none; border-radius: 10px; font-size: 16px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">❌</div>
            <h1>Paiement annulé</h1>
            <p>Vous avez annulé le paiement.<br>Vous pouvez fermer cette page et réessayer.</p>
            <button class="btn" onclick="window.close()">Fermer</button>
          </div>
        </body>
      </html>
    `;
  }

  @UseGuards(JwtAuthGuard)
  @Post('cancel')
  async cancelSubscription(@Request() req: AuthenticatedRequest) {
    return this.subscriptionsService.cancelSubscription(req.user.userId);
  }

  // ============ ADMIN ROUTES ============

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats(@Request() req: AuthenticatedRequest) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Only admins can view subscription stats');
    }
    return this.subscriptionsService.getStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getAllSubscriptions(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Only admins can view all subscriptions');
    }
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.subscriptionsService.getAllSubscriptions(pageNum, limitNum);
  }

  // Payments endpoint - returns subscriptions formatted as payments
  @UseGuards(JwtAuthGuard)
  @Get('payments')
  async getAllPayments(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Only admins can view payments');
    }
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.subscriptionsService.getAllPayments(pageNum, limitNum);
  }

  // Get user's subscription for admin
  @UseGuards(JwtAuthGuard)
  @Get('users/:userId/subscription')
  async getUserSubscriptionAdmin(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Only admins can view user subscriptions');
    }
    return this.subscriptionsService.getUserSubscription(userId);
  }

  // Get user's payment history for admin (from subscriptions)
  @UseGuards(JwtAuthGuard)
  @Get('users/:userId/payments')
  async getUserPaymentsAdmin(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Only admins can view user payments');
    }
    return this.subscriptionsService.getUserPayments(userId);
  }

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
