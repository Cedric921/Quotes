import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { SocialNetwork } from './entities/social-network.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SocialNetwork])],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}

