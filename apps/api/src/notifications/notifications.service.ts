import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { PushToken } from './entities/push-token.entity';
import { UserNotificationSettings } from '../users/entities/user-notification-settings.entity';
import { Quote } from '../quotes/entities/quote.entity';
import { User } from '../users/entities/user.entity';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';

// Freemium cap: free users can receive at most 2 notifications per day.
// Premium users use the value configured in their notification settings.
const FREE_MAX_NOTIFICATIONS_PER_DAY = 2;

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
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
    const quotes = await this.getRandomQuotes(1);
    return quotes[0] || null;
  }

  /** Plusieurs citations au hasard, en un seul tri. */
  private getRandomQuotes(count: number): Promise<Quote[]> {
    return this.quoteRepository
      .createQueryBuilder('quote')
      .leftJoinAndSelect('quote.topic', 'topic')
      .orderBy('RANDOM()')
      .limit(Math.max(count, 1))
      .getMany();
  }

  /** Parmi ces utilisateurs, lesquels ont un abonnement actif. */
  private async premiumUserIds(userIds: string[]): Promise<Set<string>> {
    if (userIds.length === 0) return new Set();

    const users = await this.userRepository.find({
      where: { id: In(userIds), isSubscribed: true },
      select: ['id', 'subscriptionEndDate'],
    });

    const now = new Date();
    return new Set(
      users
        .filter(
          (user) =>
            user.subscriptionEndDate &&
            new Date(user.subscriptionEndDate) > now,
        )
        .map((user) => user.id),
    );
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

  // Helper to convert "HH:mm" to minutes since midnight
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Helper to check if current time is within the notification window
  private isWithinTimeWindow(
    currentMinutes: number,
    startMinutes: number,
    endMinutes: number,
  ): boolean {
    // Handle case where window crosses midnight (e.g., 22:00 to 06:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  // Helper to calculate random notification times for a user
  private calculateRandomNotificationTimes(
    startTime: string,
    endTime: string,
    count: number,
  ): string[] {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    // Calculate window duration (handle midnight crossing)
    let windowDuration = endMinutes - startMinutes;
    if (windowDuration < 0) {
      windowDuration += 24 * 60; // Add 24 hours in minutes
    }

    // Generate random times spread across the window
    const times: number[] = [];
    const minInterval = Math.floor(windowDuration / (count + 1)); // Minimum interval between notifications

    for (let i = 0; i < count; i++) {
      let randomMinute: number;
      let attempts = 0;

      do {
        // Generate random time within the window
        const randomOffset = Math.floor(Math.random() * windowDuration);
        randomMinute = (startMinutes + randomOffset) % (24 * 60);
        attempts++;
      } while (
        times.some((t) => Math.abs(t - randomMinute) < minInterval) &&
        attempts < 10
      );

      times.push(randomMinute);
    }

    // Convert minutes back to "HH:mm" format
    return times.map((m) => {
      const hours = Math.floor(m / 60);
      const minutes = m % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    });
  }

  // Cron job that runs every minute to check for notifications to send
  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledNotifications(): Promise<void> {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    const currentMinutes = currentHour * 60 + currentMinute;
    const today = now.toISOString().split('T')[0]; // "YYYY-MM-DD"

    this.logger.debug(
      `Checking notifications for day ${currentDay}, time ${currentTime}`,
    );

    // Get all enabled notification settings
    const allSettings = await this.notificationSettingsRepository.find({
      where: { enabled: true },
    });

    // Le statut premium de tout le monde, en une requete.
    //
    // Il etait auparavant demande utilisateur par utilisateur, a l'interieur de
    // la boucle - et cette boucle tourne toutes les minutes. Avec mille
    // reglages actifs cela faisait 1,44 million de requetes par jour pour lire
    // deux colonnes qui changent une fois par mois.
    const premiumUserIds = await this.premiumUserIds(
      allSettings.map((settings) => settings.userId),
    );

    // Filter users who should receive notifications now
    const usersToNotify: { userId: string; settingsId: string }[] = [];

    for (const settings of allSettings) {
      try {
        // Parse active days
        const activeDays: number[] = JSON.parse(settings.activeDays || '[]');

        // Check if today is an active day
        if (!activeDays.includes(currentDay)) {
          continue;
        }

        // Check if within time window
        const startMinutes = this.timeToMinutes(settings.startTime);
        const endMinutes = this.timeToMinutes(settings.endTime);

        if (
          !this.isWithinTimeWindow(currentMinutes, startMinutes, endMinutes)
        ) {
          continue;
        }

        // Parse daily tracker
        let tracker = JSON.parse(
          settings.dailyNotificationTracker ||
            '{"date":"","count":0,"times":[]}',
        );

        // Reset tracker if it's a new day
        if (tracker.date !== today) {
          tracker = { date: today, count: 0, times: [] };
        }

        // Apply freemium cap: free users get at most 2 notifications per day
        const isPremium = premiumUserIds.has(settings.userId);
        const effectiveMaxPerDay = isPremium
          ? settings.maxNotificationsPerDay
          : Math.min(
              settings.maxNotificationsPerDay,
              FREE_MAX_NOTIFICATIONS_PER_DAY,
            );

        // Check if max notifications reached for today
        if (tracker.count >= effectiveMaxPerDay) {
          continue;
        }

        // Calculate probability of sending notification this minute
        // Based on remaining notifications and remaining time in the window
        const remainingNotifications = effectiveMaxPerDay - tracker.count;
        let remainingMinutes: number;

        if (startMinutes > endMinutes) {
          // Window crosses midnight
          if (currentMinutes >= startMinutes) {
            remainingMinutes = 24 * 60 - currentMinutes + endMinutes;
          } else {
            remainingMinutes = endMinutes - currentMinutes;
          }
        } else {
          remainingMinutes = endMinutes - currentMinutes;
        }

        // Ensure we don't divide by zero
        remainingMinutes = Math.max(remainingMinutes, 1);

        // Probability: we want to spread notifications evenly
        // If 3 notifications remain in 180 minutes, probability = 3/180 = ~1.67% per minute
        const probability = remainingNotifications / remainingMinutes;

        // Random check based on probability
        if (Math.random() < probability) {
          usersToNotify.push({
            userId: settings.userId,
            settingsId: settings.id,
          });

          // Update tracker
          tracker.count++;
          tracker.times.push(currentTime);
          settings.dailyNotificationTracker = JSON.stringify(tracker);
          await this.notificationSettingsRepository.save(settings);
        }
      } catch (error) {
        this.logger.error(
          `Error processing notifications for user ${settings.userId}`,
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

    // Une citation differente par destinataire, tirees ensemble.
    //
    // `ORDER BY RANDOM()` trie la table entiere a chaque appel ; le faire une
    // fois pour cent destinataires plutot que cent fois change l'ordre de
    // grandeur du travail demande a la base, sans rien changer au resultat.
    const userIds = usersToNotify.map(({ userId }) => userId);
    const [quotePool, allPushTokens] = await Promise.all([
      this.getRandomQuotes(userIds.length),
      this.pushTokenRepository.find({
        where: { userId: In(userIds), isActive: true },
      }),
    ]);

    if (quotePool.length === 0) {
      this.logger.warn('No quotes available to send');
      return;
    }

    const tokensByUser = new Map<string, string[]>();
    for (const pushToken of allPushTokens) {
      const existing = tokensByUser.get(pushToken.userId);
      if (existing) {
        existing.push(pushToken.token);
      } else {
        tokensByUser.set(pushToken.userId, [pushToken.token]);
      }
    }

    // Send notification to each user with a different random quote
    for (const [index, { userId }] of usersToNotify.entries()) {
      // Le vivier peut etre plus petit que le nombre de destinataires quand il
      // y a moins de citations que d'utilisateurs a notifier ; on boucle.
      const quote = quotePool[index % quotePool.length];

      const tokens = tokensByUser.get(userId);

      if (!tokens || tokens.length === 0) {
        continue;
      }

      await this.sendPushNotifications(
        tokens,
        'Focus',
        quote.text.length > 100
          ? quote.text.substring(0, 97) + '...'
          : quote.text,
        {
          quoteId: quote.id,
          author: quote.author,
          topicId: quote.topic?.id,
        },
      );
    }

    // Une seule ecriture pour tous les jetons servis, plutot qu'une par
    // destinataire.
    if (allPushTokens.length > 0) {
      await this.pushTokenRepository.update(
        { token: In(allPushTokens.map((pushToken) => pushToken.token)) },
        { lastUsedAt: new Date() },
      );
    }

    this.logger.log(
      `Successfully sent notifications to ${usersToNotify.length} users`,
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
      'Focus',
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
