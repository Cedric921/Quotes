import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserNotificationSettings } from './entities/user-notification-settings.entity';
import { UserActivity } from './entities/user-activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserNotificationSettings, UserActivity]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
