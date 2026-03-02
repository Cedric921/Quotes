import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Get,
  ForbiddenException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { NotificationsService } from './notifications.service';
import { PremiumNotificationCronService } from './premium-notification-cron.service';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
    email: string;
    isAdmin: boolean;
  };
}

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly premiumNotificationCronService: PremiumNotificationCronService,
  ) {}

  // Register a push token for the authenticated user
  @UseGuards(JwtAuthGuard)
  @Post('push-token')
  registerPushToken(
    @Request() req: AuthenticatedRequest,
    @Body() dto: RegisterPushTokenDto,
  ) {
    return this.notificationsService.registerPushToken(req.user.userId, dto);
  }

  // Unregister a specific push token
  @UseGuards(JwtAuthGuard)
  @Delete('push-token/:token')
  unregisterPushToken(
    @Request() req: AuthenticatedRequest,
    @Param('token') token: string,
  ) {
    return this.notificationsService.unregisterPushToken(
      req.user.userId,
      token,
    );
  }

  // Unregister all push tokens for the user (e.g., on logout)
  @UseGuards(JwtAuthGuard)
  @Delete('push-tokens')
  unregisterAllPushTokens(@Request() req: AuthenticatedRequest) {
    return this.notificationsService.unregisterAllPushTokens(req.user.userId);
  }

  // Get all push tokens for the user
  @UseGuards(JwtAuthGuard)
  @Get('push-tokens')
  getUserPushTokens(@Request() req: AuthenticatedRequest) {
    return this.notificationsService.getUserPushTokens(req.user.userId);
  }

  // Send a test notification to the user
  @UseGuards(JwtAuthGuard)
  @Post('test')
  sendTestNotification(@Request() req: AuthenticatedRequest) {
    return this.notificationsService.sendTestNotification(req.user.userId);
  }

  // ==================== ADMIN ENDPOINTS ====================

  // Send a premium quote notification to all premium users (Admin only)
  @UseGuards(JwtAuthGuard)
  @Post('admin/send-premium-quote')
  async sendPremiumQuoteNotification(
    @Request() req: AuthenticatedRequest,
    @Body() body: { quoteId?: string },
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.premiumNotificationCronService.sendManualPremiumQuoteNotification(
      body.quoteId,
    );
  }

  // Send an announcement to all premium users (Admin only)
  @UseGuards(JwtAuthGuard)
  @Post('admin/send-announcement')
  async sendAnnouncementToPremiumUsers(
    @Request() req: AuthenticatedRequest,
    @Body() body: { title: string; body: string; data?: Record<string, any> },
  ) {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.premiumNotificationCronService.sendAnnouncementToPremiumUsers(
      body.title,
      body.body,
      body.data,
    );
  }
}
