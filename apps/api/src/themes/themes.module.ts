import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ThemesService } from './themes.service';
import { ThemesController } from './themes.controller';
import { CloudinaryService } from './cloudinary.service';
import { Theme } from './entities/theme.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Theme]),
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  ],
  controllers: [ThemesController],
  providers: [ThemesService, CloudinaryService],
  exports: [ThemesService],
})
export class ThemesModule {}

