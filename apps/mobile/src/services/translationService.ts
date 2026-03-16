import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../i18n";
import { API_CONFIG } from "../constants/config";

const TRANSLATION_CACHE_KEY = "@focus_translation_cache";
const CACHE_EXPIRY_DAYS = 30; // Longer cache for AI translations

interface CacheEntry {
  translation: string;
  timestamp: number;
}

interface TranslationCache {
  [key: string]: CacheEntry;
}

// Map app language codes to DeepL language codes
const DEEPL_LANG_MAP: Record<string, string> = {
  en: "EN",
  fr: "FR",
  es: "ES",
  ar: "AR", // Note: DeepL doesn't support Arabic yet, will fallback
  de: "DE",
  it: "IT",
  pt: "PT",
  nl: "NL",
  pl: "PL",
  ru: "RU",
  ja: "JA",
  zh: "ZH",
};

// Generate cache key from text and target language
const getCacheKey = (text: string, targetLang: string): string => {
  // Use hash of text for shorter keys
  const textHash = text
    .split("")
    .reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
    .toString(36);
  return `${targetLang}:${textHash}`;
};

// Load cache from AsyncStorage
const loadCache = async (): Promise<TranslationCache> => {
  try {
    const cached = await AsyncStorage.getItem(TRANSLATION_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error("Error loading translation cache:", error);
  }
  return {};
};

// Save cache to AsyncStorage
const saveCache = async (cache: TranslationCache): Promise<void> => {
  try {
    await AsyncStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Error saving translation cache:", error);
  }
};

// Check if cache entry is expired
const isCacheExpired = (timestamp: number): boolean => {
  const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - timestamp > expiryTime;
};

/**
 * Translate text using our backend API (which uses DeepL)
 * The backend handles the API key securely
 */
const translateWithBackend = async (
  text: string,
  targetLang: string,
  sourceLang: string = "EN",
): Promise<string | null> => {
  try {
    const response = await fetch(
      `${API_CONFIG.getBaseUrl()}/translations/translate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          targetLang: DEEPL_LANG_MAP[targetLang] || targetLang.toUpperCase(),
          sourceLang,
        }),
      },
    );

    if (!response.ok) {
      console.warn("Backend translation failed:", response.status);
      return null;
    }

    const data = await response.json();
    return data.translatedText || null;
  } catch (error) {
    console.warn("Backend translation error:", error);
    return null;
  }
};

/**
 * Fallback translation using MyMemory API (free, no API key)
 */
const translateWithMyMemory = async (
  text: string,
  targetLang: string,
  sourceLang: string = "en",
): Promise<string | null> => {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }

    return null;
  } catch (error) {
    console.warn("MyMemory translation error:", error);
    return null;
  }
};

/**
 * Main translation function with caching and fallback
 * Priority: 1. Cache -> 2. Backend (DeepL) -> 3. MyMemory (fallback)
 * Note: Default source language is French since quotes are in French
 */
export const translateText = async (
  text: string,
  targetLang: string,
  sourceLang: string = "fr",
): Promise<string> => {
  // Don't translate if target is same as source
  if (targetLang === sourceLang) {
    return text;
  }

  // Check cache first
  const cache = await loadCache();
  const cacheKey = getCacheKey(text, targetLang);

  if (cache[cacheKey] && !isCacheExpired(cache[cacheKey].timestamp)) {
    return cache[cacheKey].translation;
  }

  let translation: string | null = null;

  // Try backend (DeepL) first
  translation = await translateWithBackend(text, targetLang, sourceLang);

  // Fallback to MyMemory if backend fails
  if (!translation) {
    translation = await translateWithMyMemory(text, targetLang, sourceLang);
  }

  // If we got a translation, cache it
  if (translation) {
    cache[cacheKey] = {
      translation,
      timestamp: Date.now(),
    };
    await saveCache(cache);
    return translation;
  }

  // Return original text if all translation methods fail
  return text;
};

/**
 * Translate a quote (text only, author name is kept as-is)
 * Note: Quotes are in French, so we translate FROM French to target language
 */
export const translateQuote = async (
  text: string,
  author: string,
  targetLang?: string,
): Promise<{ text: string; author: string }> => {
  const lang = targetLang || i18n.language || "en";

  // Don't translate if language is French (quotes are already in French)
  if (lang === "fr") {
    return { text, author };
  }

  const translatedText = await translateText(text, lang, "fr");

  return {
    text: translatedText,
    author, // Keep author name as-is
  };
};

/**
 * Clear translation cache
 */
export const clearTranslationCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TRANSLATION_CACHE_KEY);
  } catch (error) {
    console.error("Error clearing translation cache:", error);
  }
};

/**
 * Get current app language
 */
export const getCurrentLanguage = (): string => {
  return i18n.language || "en";
};
