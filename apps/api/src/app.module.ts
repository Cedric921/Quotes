import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { QuotesModule } from './quotes/quotes.module';
import { TopicsModule } from './topics/topics.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ThemesModule } from './themes/themes.module';
import { FontsModule } from './fonts/fonts.module';
import { HealthModule } from './health/health.module';
import { TranslationsModule } from './translations/translations.module';
import { ContactModule } from './contact/contact.module';
import { SocialModule } from './social/social.module';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRoot(getDatabaseConfig()),
    ScheduleModule.forRoot(),
    UsersModule,
    QuotesModule,
    TopicsModule,
    AuthModule,
    NotificationsModule,
    SubscriptionsModule,
    ThemesModule,
    FontsModule,
    HealthModule,
    TranslationsModule,
    ContactModule,
    SocialModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
