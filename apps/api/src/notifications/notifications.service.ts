import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { PushToken } from './entities/push-token.entity';
import { UserNotificationSettings } from '../users/entities/user-notification-settings.entity';
import { Quote } from '../quotes/entities/quote.entity';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private expo: Expo;

  constructor(
    @InjectRepository(PushToken)
    private pushTokenRepository: Repository<PushToken>,
    @InjectRepository(UserNotificationSettings)
    private notificationSettingsRepository: Repository<UserNotificationSettings>,
    @InjectRepository(Quote)
    private quoteRepository: Repository<Quote>,
  ) {
    this.expo = new Expo();
  }

  // Register a push token for a user
  async registerPushToken(
    userId: string,
    dto: RegisterPushTokenDto,
  ): Promise<PushToken> {
    // Check if token already exists
    let pushToken = await this.pushTokenRepository.findOne({
      where: { token: dto.token },
    });

    if (pushToken) {
      // Update existing token (might be from different user or device)
      pushToken.userId = userId;
      if (dto.deviceId) pushToken.deviceId = dto.deviceId;
      if (dto.platform) pushToken.platform = dto.platform;
      pushToken.isActive = true;
    } else {
      // Create new token
      pushToken = this.pushTokenRepository.create({
        userId,
        token: dto.token,
        deviceId: dto.deviceId ?? undefined,
        platform: dto.platform ?? undefined,
        isActive: true,
      });
    }

    return this.pushTokenRepository.save(pushToken);
  }

  // Unregister a push token
  async unregisterPushToken(userId: string, token: string): Promise<void> {
    await this.pushTokenRepository.delete({ userId, token });
  }

  // Unregister all push tokens for a user
  async unregisterAllPushTokens(userId: string): Promise<void> {
    await this.pushTokenRepository.delete({ userId });
  }

  // Get all active push tokens for a user
  async getUserPushTokens(userId: string): Promise<PushToken[]> {
    return this.pushTokenRepository.find({
      where: { userId, isActive: true },
    });
  }

  // Get a random quote
  private async getRandomQuote(): Promise<Quote | null> {
    const quotes = await this.quoteRepository
      .createQueryBuilder('quote')
      .leftJoinAndSelect('quote.topic', 'topic')
      .orderBy('RANDOM()')
      .limit(1)
      .getMany();

    return quotes[0] || null;
  }

  // Send push notification to specific tokens
  async sendPushNotifications(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    // Filter valid Expo push tokens
    const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));

    if (validTokens.length === 0) {
      this.logger.warn('No valid Expo push tokens to send to');
      return;
    }

    // Create messages
    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
    }));

    // Send in chunks (Expo recommends max 100 per request)
    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        const ticketChunk: ExpoPushTicket[] =
          await this.expo.sendPushNotificationsAsync(chunk);

        // Handle errors
        for (let i = 0; i < ticketChunk.length; i++) {
          const ticket = ticketChunk[i];
          if (ticket.status === 'error') {
            this.logger.error(
              `Error sending notification: ${ticket.message}`,
              ticket.details,
            );

            // If token is invalid, mark it as inactive
            if (
              ticket.details?.error === 'DeviceNotRegistered' ||
              ticket.details?.error === 'InvalidCredentials'
            ) {
              await this.pushTokenRepository.update(
                { token: validTokens[i] },
                { isActive: false },
              );
            }
          }
        }
      } catch (error) {
        this.logger.error('Error sending push notifications chunk', error);
      }
    }
  }

  // Cron job that runs every minute to check for notifications to send
  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledNotifications(): Promise<void> {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    this.logger.debug(
      `Checking notifications for day ${currentDay}, time ${currentTime}`,
    );

    // Get all enabled notification settings
    const allSettings = await this.notificationSettingsRepository.find({
      where: { enabled: true },
    });

    // Filter users who should receive notifications now
    const usersToNotify: string[] = [];

    for (const settings of allSettings) {
      try {
        const notifications = JSON.parse(settings.notifications || '[]');

        for (const notification of notifications) {
          // Check if current time matches and current day is in the days array
          if (
            notification.time === currentTime &&
            notification.days?.includes(currentDay)
          ) {
            usersToNotify.push(settings.userId);
            break; // Only add user once even if multiple notifications match
          }
        }
      } catch (error) {
        this.logger.error(
          `Error parsing notifications for user ${settings.userId}`,
          error,
        );
      }
    }

    if (usersToNotify.length === 0) {
      return;
    }

    this.logger.log(
      `Sending notifications to ${usersToNotify.length} users at ${currentTime}`,
    );

    // Get a random quote
    const quote = await this.getRandomQuote();

    if (!quote) {
      this.logger.warn('No quotes available to send');
      return;
    }

    // Get push tokens for all users to notify
    const pushTokens = await this.pushTokenRepository.find({
      where: usersToNotify.map((userId) => ({ userId, isActive: true })),
    });

    if (pushTokens.length === 0) {
      this.logger.warn('No active push tokens found for users to notify');
      return;
    }

    const tokens = pushTokens.map((pt) => pt.token);

    // Send notifications
    await this.sendPushNotifications(
      tokens,
      '📖 Citation du moment',
      quote.text.length > 100
        ? quote.text.substring(0, 97) + '...'
        : quote.text,
      {
        quoteId: quote.id,
        author: quote.author,
        topicId: quote.topic?.id,
      },
    );

    // Update lastUsedAt for tokens
    await this.pushTokenRepository.update(
      { token: tokens as any },
      { lastUsedAt: new Date() },
    );

    this.logger.log(
      `Successfully sent notifications to ${tokens.length} devices`,
    );
  }

  // Send a test notification to a user
  async sendTestNotification(userId: string): Promise<{ sent: number }> {
    const pushTokens = await this.getUserPushTokens(userId);

    if (pushTokens.length === 0) {
      return { sent: 0 };
    }

    const quote = await this.getRandomQuote();
    const tokens = pushTokens.map((pt) => pt.token);

    await this.sendPushNotifications(
      tokens,
      '🔔 Test de notification',
      quote
        ? quote.text.length > 100
          ? quote.text.substring(0, 97) + '...'
          : quote.text
        : 'Vos notifications fonctionnent parfaitement !',
      quote ? { quoteId: quote.id, author: quote.author } : undefined,
    );

    return { sent: tokens.length };
  }
}
