import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

interface DeepLTranslation {
  detected_source_language: string;
  text: string;
}

interface DeepLResponse {
  translations: DeepLTranslation[];
}

@Injectable()
export class TranslationsService {
  private readonly logger = new Logger(TranslationsService.name);
  private readonly deeplApiKey: string;
  private readonly deeplApiUrl: string;

  constructor(private configService: ConfigService) {
    this.deeplApiKey = this.configService.get<string>("DEEPL_API_KEY") || "";
    // Use free API endpoint by default, pro endpoint for paid accounts
    const isPro = this.configService.get<string>("DEEPL_API_PRO") === "true";
    this.deeplApiUrl = isPro
      ? "https://api.deepl.com/v2/translate"
      : "https://api-free.deepl.com/v2/translate";
  }

  /**
   * Translate text using DeepL API
   * @param text Text to translate
   * @param targetLang Target language code (e.g., 'FR', 'ES', 'DE')
   * @param sourceLang Source language code (default: 'EN')
   */
  async translate(
    text: string,
    targetLang: string,
    sourceLang: string = "EN",
  ): Promise<string> {
    if (!this.deeplApiKey) {
      this.logger.warn("DeepL API key not configured");
      throw new Error("Translation service not configured");
    }

    // DeepL doesn't support Arabic yet
    const unsupportedLanguages = ["AR"];
    if (unsupportedLanguages.includes(targetLang.toUpperCase())) {
      this.logger.warn(`Language ${targetLang} not supported by DeepL`);
      throw new Error(`Language ${targetLang} not supported`);
    }

    try {
      const response = await fetch(this.deeplApiUrl, {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${this.deeplApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: [text],
          target_lang: targetLang.toUpperCase(),
          source_lang: sourceLang.toUpperCase(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`DeepL API error: ${response.status} - ${errorText}`);
        throw new Error(`Translation failed: ${response.status}`);
      }

      const data: DeepLResponse = await response.json();

      if (data.translations && data.translations.length > 0) {
        return data.translations[0].text;
      }

      throw new Error("No translation returned");
    } catch (error) {
      this.logger.error(`Translation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if the translation service is available
   */
  isAvailable(): boolean {
    return !!this.deeplApiKey;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return [
      "BG", // Bulgarian
      "CS", // Czech
      "DA", // Danish
      "DE", // German
      "EL", // Greek
      "EN", // English
      "ES", // Spanish
      "ET", // Estonian
      "FI", // Finnish
      "FR", // French
      "HU", // Hungarian
      "ID", // Indonesian
      "IT", // Italian
      "JA", // Japanese
      "KO", // Korean
      "LT", // Lithuanian
      "LV", // Latvian
      "NB", // Norwegian
      "NL", // Dutch
      "PL", // Polish
      "PT", // Portuguese
      "RO", // Romanian
      "RU", // Russian
      "SK", // Slovak
      "SL", // Slovenian
      "SV", // Swedish
      "TR", // Turkish
      "UK", // Ukrainian
      "ZH", // Chinese
    ];
  }
}

