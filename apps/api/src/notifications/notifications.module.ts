import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PremiumNotificationCronService } from './premium-notification-cron.service';
import { PushToken } from './entities/push-token.entity';
import { UserNotificationSettings } from '../users/entities/user-notification-settings.entity';
import { Quote } from '../quotes/entities/quote.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PushToken,
      UserNotificationSettings,
      Quote,
      User,
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, PremiumNotificationCronService],
  exports: [NotificationsService, PremiumNotificationCronService],
})
export class NotificationsModule {}
