import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { PushToken } from './entities/push-token.entity';
import { User } from '../users/entities/user.entity';
import { Quote } from '../quotes/entities/quote.entity';

@Injectable()
export class PremiumNotificationCronService {
  private readonly logger = new Logger(PremiumNotificationCronService.name);

  // Messages de rappel pour les utilisateurs premium
  private readonly reminderMessages = [
    {
      title: '✨ Focus Premium',
      body: 'Découvrez votre citation inspirante du jour !',
    },
    {
      title: '🌟 Moment de sagesse',
      body: 'Prenez une pause et laissez-vous inspirer par nos citations premium.',
    },
    {
      title: '💎 Contenu exclusif',
      body: 'De nouvelles citations premium vous attendent dans Focus.',
    },
    {
      title: '🔮 Inspiration quotidienne',
      body: "N'oubliez pas de consulter vos citations du jour !",
    },
    {
      title: '⭐ Focus vous attend',
      body: 'Votre dose quotidienne de motivation est prête.',
    },
  ];

  constructor(
    @InjectRepository(PushToken)
    private pushTokenRepository: Repository<PushToken>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Quote)
    private quoteRepository: Repository<Quote>,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Get all premium users' push tokens
   */
  private async getPremiumUserTokens(): Promise<string[]> {
    const now = new Date();

    // Find premium users (subscribed and subscription not expired)
    const premiumUsers = await this.userRepository.find({
      where: {
        isSubscribed: true,
        subscriptionEndDate: MoreThan(now),
      },
      select: ['id'],
    });

    if (premiumUsers.length === 0) {
      return [];
    }

    const userIds = premiumUsers.map((u) => u.id);

    // Get their push tokens
    const pushTokens = await this.pushTokenRepository
      .createQueryBuilder('token')
      .where('token.userId IN (:...userIds)', { userIds })
      .andWhere('token.isActive = :isActive', { isActive: true })
      .getMany();

    return pushTokens.map((pt) => pt.token);
  }

  /**
   * Get a random premium quote
   */
  private async getRandomPremiumQuote(): Promise<Quote | null> {
    const quotes = await this.quoteRepository
      .createQueryBuilder('quote')
      .leftJoinAndSelect('quote.topic', 'topic')
      .where('topic.isPremium = :isPremium', { isPremium: true })
      .orderBy('RANDOM()')
      .limit(1)
      .getMany();

    return quotes[0] || null;
  }

  // ==================== REMINDER NOTIFICATIONS ====================

  /**
   * Rappel du matin - 08:00
   */
  @Cron('0 8 * * *')
  async sendMorningReminder() {
    this.logger.log('🌅 Sending morning reminder to premium users...');
    await this.sendReminderNotification(0);
  }

  /**
   * Rappel de midi - 12:30
   */
  @Cron('30 12 * * *')
  async sendNoonReminder() {
    this.logger.log('☀️ Sending noon reminder to premium users...');
    await this.sendReminderNotification(1);
  }

  /**
   * Rappel du soir - 19:00
   */
  @Cron('0 19 * * *')
  async sendEveningReminder() {
    this.logger.log('🌙 Sending evening reminder to premium users...');
    await this.sendReminderNotification(2);
  }

  /**
   * Send a reminder notification with a specific message
   */
  private async sendReminderNotification(messageIndex: number) {
    try {
      const tokens = await this.getPremiumUserTokens();

      if (tokens.length === 0) {
        this.logger.log('No premium users to notify');
        return;
      }

      const message =
        this.reminderMessages[messageIndex % this.reminderMessages.length];

      await this.notificationsService.sendPushNotifications(
        tokens,
        message.title,
        message.body,
        { type: 'reminder' },
      );

      this.logger.log(`✅ Reminder sent to ${tokens.length} premium users`);
    } catch (error) {
      this.logger.error('Error sending reminder notification:', error);
    }
  }

  // ==================== RANDOM PREMIUM QUOTE NOTIFICATION ====================

  /**
   * Citation premium aléatoire - 15:00
   */
  @Cron('0 15 * * *')
  async sendRandomPremiumQuote() {
    this.logger.log('📖 Sending random premium quote to premium users...');

    try {
      const tokens = await this.getPremiumUserTokens();

      if (tokens.length === 0) {
        this.logger.log('No premium users to notify');
        return;
      }

      const quote = await this.getRandomPremiumQuote();

      if (!quote) {
        this.logger.warn('No premium quotes available');
        return;
      }

      const truncatedText =
        quote.text.length > 120
          ? quote.text.substring(0, 117) + '...'
          : quote.text;

      await this.notificationsService.sendPushNotifications(
        tokens,
        `💎 ${quote.author || 'Citation du jour'}`,
        truncatedText,
        {
          type: 'premium_quote',
          quoteId: quote.id,
          author: quote.author,
          topicId: quote.topic?.id,
        },
      );

      this.logger.log(
        `✅ Premium quote sent to ${tokens.length} premium users`,
      );
    } catch (error) {
      this.logger.error('Error sending premium quote notification:', error);
    }
  }

  // ==================== NEW PREMIUM QUOTE NOTIFICATION ====================

  /**
   * Check for new premium quotes - Every hour
   * Sends notification when new premium quotes are available
   */
  @Cron('0 * * * *') // Every hour at minute 0
  async checkAndNotifyNewPremiumQuotes() {
    this.logger.debug('🔍 Checking for new premium quotes...');

    try {
      // Check for quotes created in the last hour
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const newQuotes = await this.quoteRepository
        .createQueryBuilder('quote')
        .leftJoinAndSelect('quote.topic', 'topic')
        .where('topic.isPremium = :isPremium', { isPremium: true })
        .andWhere('quote.createdAt > :oneHourAgo', { oneHourAgo })
        .getMany();

      if (newQuotes.length === 0) {
        this.logger.debug('No new premium quotes found');
        return;
      }

      this.logger.log(`Found ${newQuotes.length} new premium quote(s)`);

      const tokens = await this.getPremiumUserTokens();

      if (tokens.length === 0) {
        this.logger.log('No premium users to notify');
        return;
      }

      // Send notification about the first new quote
      const quote = newQuotes[0];
      const truncatedText =
        quote.text.length > 100
          ? quote.text.substring(0, 97) + '...'
          : quote.text;

      await this.notificationsService.sendPushNotifications(
        tokens,
        '🆕 Nouvelle citation premium !',
        truncatedText,
        {
          type: 'new_premium_quote',
          quoteId: quote.id,
          author: quote.author,
          topicId: quote.topic?.id,
          totalNewQuotes: newQuotes.length,
        },
      );

      this.logger.log(
        `✅ New premium quote notification sent to ${tokens.length} users`,
      );
    } catch (error) {
      this.logger.error('Error checking for new premium quotes:', error);
    }
  }

  // ==================== MANUAL TRIGGER METHODS ====================

  /**
   * Manually trigger a premium quote notification
   * Can be called from admin panel or API
   */
  async sendManualPremiumQuoteNotification(quoteId?: string): Promise<{
    sent: number;
    message: string;
  }> {
    const tokens = await this.getPremiumUserTokens();

    if (tokens.length === 0) {
      return { sent: 0, message: 'No premium users to notify' };
    }

    let quote: Quote | null;

    if (quoteId) {
      quote = await this.quoteRepository.findOne({
        where: { id: quoteId },
        relations: ['topic'],
      });
    } else {
      quote = await this.getRandomPremiumQuote();
    }

    if (!quote) {
      return { sent: 0, message: 'Quote not found' };
    }

    const truncatedText =
      quote.text.length > 100
        ? quote.text.substring(0, 97) + '...'
        : quote.text;

    await this.notificationsService.sendPushNotifications(
      tokens,
      `💎 ${quote.author || 'Citation premium'}`,
      truncatedText,
      {
        type: 'manual_premium_quote',
        quoteId: quote.id,
        author: quote.author,
        topicId: quote.topic?.id,
      },
    );

    return {
      sent: tokens.length,
      message: `Notification sent to ${tokens.length} premium users`,
    };
  }

  /**
   * Send notification to all premium users about app update or announcement
   */
  async sendAnnouncementToPremiumUsers(
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<{ sent: number }> {
    const tokens = await this.getPremiumUserTokens();

    if (tokens.length === 0) {
      return { sent: 0 };
    }

    await this.notificationsService.sendPushNotifications(tokens, title, body, {
      type: 'announcement',
      ...data,
    });

    return { sent: tokens.length };
  }
}
