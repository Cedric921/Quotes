import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FontsService } from './fonts.service';
import { FontsController } from './fonts.controller';
import { Font } from './entities/font.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Font])],
  controllers: [FontsController],
  providers: [FontsService],
  exports: [FontsService],
})
export class FontsModule {}

