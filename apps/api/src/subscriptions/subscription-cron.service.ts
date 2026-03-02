import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan, Between } from 'typeorm';
import {
  Subscription,
  SubscriptionStatus,
} from './entities/subscription.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SubscriptionCronService {
  private readonly logger = new Logger(SubscriptionCronService.name);

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Cron job qui s'exécute tous les jours à minuit (00:00)
   * - Vérifie les abonnements expirés
   * - Met à jour le statut des abonnements et des utilisateurs
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredSubscriptions() {
    this.logger.log('🔄 Checking for expired subscriptions...');

    const now = new Date();

    // Trouver tous les abonnements actifs qui ont expiré
    const expiredSubscriptions = await this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: LessThanOrEqual(now),
      },
      relations: ['user'],
    });

    this.logger.log(
      `Found ${expiredSubscriptions.length} expired subscriptions`,
    );

    for (const subscription of expiredSubscriptions) {
      try {
        // Mettre à jour le statut de l'abonnement
        subscription.status = SubscriptionStatus.EXPIRED;
        await this.subscriptionRepository.save(subscription);

        // Vérifier si l'utilisateur a un autre abonnement actif
        const hasActiveSubscription = await this.subscriptionRepository.findOne(
          {
            where: {
              userId: subscription.userId,
              status: SubscriptionStatus.ACTIVE,
              endDate: MoreThan(now),
            },
          },
        );

        // Si pas d'autre abonnement actif, retirer le statut premium
        if (!hasActiveSubscription) {
          await this.userRepository.update(subscription.userId, {
            isSubscribed: false,
            subscriptionEndDate: undefined as any,
          });
          this.logger.log(`User ${subscription.userId} premium status removed`);
        }

        this.logger.log(`Subscription ${subscription.id} marked as EXPIRED`);
      } catch (error) {
        this.logger.error(
          `Error processing subscription ${subscription.id}:`,
          error,
        );
      }
    }

    this.logger.log('✅ Expired subscriptions check completed');
  }

  /**
   * Cron job qui s'exécute tous les jours à 09:00
   * - Trouve les abonnements qui expirent dans 7 jours
   * - TODO: Envoyer un email de rappel de renouvellement
   */
  @Cron('0 9 * * *') // Tous les jours à 9h00
  async handleRenewalReminders() {
    this.logger.log('🔔 Checking for subscriptions expiring in 7 days...');

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Trouver les abonnements qui expirent dans exactement 7 jours (+/- 12h)
    const startOfDay = new Date(sevenDaysFromNow);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(sevenDaysFromNow);
    endOfDay.setHours(23, 59, 59, 999);

    const expiringSubscriptions = await this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: Between(startOfDay, endOfDay),
      },
      relations: ['user', 'plan'],
    });

    this.logger.log(
      `Found ${expiringSubscriptions.length} subscriptions expiring in 7 days`,
    );

    for (const subscription of expiringSubscriptions) {
      try {
        // TODO: Implémenter l'envoi d'email de rappel
        // Exemple avec un service email:
        // await this.emailService.sendRenewalReminder({
        //   to: subscription.user.email,
        //   userName: subscription.user.name || 'Utilisateur',
        //   planName: subscription.plan.name,
        //   expirationDate: subscription.endDate,
        //   renewalLink: `${process.env.MOBILE_APP_URL}/subscription`,
        // });

        this.logger.log(
          `📧 TODO: Send renewal reminder to ${subscription.user?.email} for plan ${subscription.plan?.name}`,
        );
      } catch (error) {
        this.logger.error(
          `Error sending reminder for subscription ${subscription.id}:`,
          error,
        );
      }
    }

    this.logger.log('✅ Renewal reminders check completed');
  }

  /**
   * Met à jour le statut premium de l'utilisateur lors de la création d'un abonnement
   */
  async activateUserPremium(userId: string, endDate: Date) {
    await this.userRepository.update(userId, {
      isSubscribed: true,
      subscriptionEndDate: endDate,
    });
    this.logger.log(`User ${userId} premium activated until ${endDate}`);
  }
}
