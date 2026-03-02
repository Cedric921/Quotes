import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionCronService } from './subscription-cron.service';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { Subscription } from './entities/subscription.entity';
import { AppConfig } from './entities/app-config.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionPlan, Subscription, AppConfig, User]),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionCronService],
  exports: [SubscriptionsService, SubscriptionCronService],
})
export class SubscriptionsModule {}
