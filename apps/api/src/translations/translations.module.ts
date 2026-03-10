import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TranslationsController } from "./translations.controller";
import { TranslationsService } from "./translations.service";

@Module({
  imports: [ConfigModule],
  controllers: [TranslationsController],
  providers: [TranslationsService],
  exports: [TranslationsService],
})
export class TranslationsModule {}

