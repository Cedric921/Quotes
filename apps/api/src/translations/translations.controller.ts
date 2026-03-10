import {
  Controller,
  Post,
  Body,
  Get,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { TranslationsService } from "./translations.service";
import { TranslateDto, TranslateResponseDto } from "./dto/translate.dto";

@Controller("translations")
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  /**
   * Translate text using DeepL API
   * POST /translations/translate
   */
  @Post("translate")
  async translate(@Body() dto: TranslateDto): Promise<TranslateResponseDto> {
    try {
      const translatedText = await this.translationsService.translate(
        dto.text,
        dto.targetLang,
        dto.sourceLang || "EN",
      );

      return {
        translatedText,
        sourceLang: dto.sourceLang || "EN",
        targetLang: dto.targetLang,
      };
    } catch (error) {
      throw new HttpException(
        error.message || "Translation failed",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Check if translation service is available
   * GET /translations/status
   */
  @Get("status")
  getStatus(): { available: boolean; supportedLanguages: string[] } {
    return {
      available: this.translationsService.isAvailable(),
      supportedLanguages: this.translationsService.getSupportedLanguages(),
    };
  }

  /**
   * Get list of supported languages
   * GET /translations/languages
   */
  @Get("languages")
  getSupportedLanguages(): string[] {
    return this.translationsService.getSupportedLanguages();
  }
}

