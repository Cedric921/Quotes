import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PushToken } from './entities/push-token.entity';
import { UserNotificationSettings } from '../users/entities/user-notification-settings.entity';
import { Quote } from '../quotes/entities/quote.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PushToken, UserNotificationSettings, Quote]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

