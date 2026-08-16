import "server-only";
import { env } from "../env";

interface DeepLResponse {
  translations?: { detected_source_language: string; text: string }[];
}

/** DeepL doesn't support Arabic yet. */
const UNSUPPORTED_LANGUAGES = ["AR"];

const SUPPORTED_LANGUAGES = [
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

/** Free API endpoint by default, the pro one for paid accounts. */
function deeplUrl(): string {
  return env().DEEPL_API_PRO === "true"
    ? "https://api.deepl.com/v2/translate"
    : "https://api-free.deepl.com/v2/translate";
}

/**
 * Translates through DeepL. Throws a plain Error on any failure; the route
 * turns it into a 503 with the error's message, as NestJS did.
 */
export async function translate(text: string, targetLang: string, sourceLang = "EN"): Promise<string> {
  const apiKey = env().DEEPL_API_KEY;
  if (!apiKey) {
    console.warn("[translations] DeepL API key not configured");
    throw new Error("Translation service not configured");
  }

  if (UNSUPPORTED_LANGUAGES.includes(targetLang.toUpperCase())) {
    console.warn(`[translations] Language ${targetLang} not supported by DeepL`);
    throw new Error(`Language ${targetLang} not supported`);
  }

  try {
    const response = await fetch(deeplUrl(), {
      method: "POST",
      headers: { Authorization: `DeepL-Auth-Key ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: [text],
        target_lang: targetLang.toUpperCase(),
        source_lang: sourceLang.toUpperCase(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[translations] DeepL API error: ${response.status} - ${errorText}`);
      throw new Error(`Translation failed: ${response.status}`);
    }

    const data = (await response.json()) as DeepLResponse;
    if (data.translations && data.translations.length > 0) return data.translations[0].text;
    throw new Error("No translation returned");
  } catch (error) {
    console.error(`[translations] Translation error: ${(error as Error).message}`);
    throw error;
  }
}

export function isTranslationAvailable(): boolean {
  return !!env().DEEPL_API_KEY;
}

export function getSupportedLanguages(): string[] {
  return [...SUPPORTED_LANGUAGES];
}
