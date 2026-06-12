import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionCronService } from './subscription-cron.service';
import { PromoCodeService } from './promo-code.service';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { Subscription } from './entities/subscription.entity';
import { AppConfig } from './entities/app-config.entity';
import { PromoCode } from './entities/promo-code.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionPlan,
      Subscription,
      AppConfig,
      PromoCode,
      User,
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionCronService, PromoCodeService],
  exports: [SubscriptionsService, SubscriptionCronService, PromoCodeService],
})
export class SubscriptionsModule {}
