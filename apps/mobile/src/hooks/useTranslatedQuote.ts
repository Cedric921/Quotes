import { useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addTranslation,
  setQuoteLoading,
  removeQuoteLoading,
} from "../store/slices/translationSlice";
import { translateText } from "../services/translationService";
import { Quote } from "../types";

interface UseTranslatedQuoteResult {
  translatedText: string;
  isTranslating: boolean;
  isTranslated: boolean;
}

/**
 * Hook to automatically translate a quote based on the current app language
 * @param quote - The quote to translate
 * @returns Object with translated text and loading state
 */
export function useTranslatedQuote(quote: Quote): UseTranslatedQuoteResult {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();

  const autoTranslate = useAppSelector(
    (state) => state.translation.autoTranslate,
  );
  const translationCache = useAppSelector(
    (state) => state.translation.translationCache,
  );
  const loadingQuotes = useAppSelector(
    (state) => state.translation.loadingQuotes,
  );

  const currentLang = i18n.language || "en";
  const cacheKey = `${quote.id}:${currentLang}`;
  const cachedTranslation = translationCache[cacheKey];
  const isTranslating = loadingQuotes.includes(cacheKey);

  // Check if translation is needed
  const needsTranslation = useMemo(() => {
    // Don't translate if:
    // - Auto-translate is disabled
    // - Language is English (assuming quotes are stored in English)
    // - Already cached
    // - Currently translating
    return (
      autoTranslate &&
      currentLang !== "en" &&
      !cachedTranslation &&
      !isTranslating
    );
  }, [autoTranslate, currentLang, cachedTranslation, isTranslating]);

  // Translate the quote
  const translateQuote = useCallback(async () => {
    if (!needsTranslation) return;

    dispatch(setQuoteLoading(cacheKey));

    try {
      const translated = await translateText(quote.text, currentLang, "en");
      // Only cache if translation is different from original (successful translation)
      // If translation failed, translateText returns the original text
      if (translated && translated !== quote.text) {
        dispatch(
          addTranslation({ quoteId: cacheKey, translation: translated }),
        );
      } else {
        // Translation failed or returned original - just remove loading state
        // Don't cache failed translations so it can retry later
        dispatch(removeQuoteLoading(cacheKey));
      }
    } catch (error) {
      console.error("Translation error:", error);
      dispatch(removeQuoteLoading(cacheKey));
    }
  }, [needsTranslation, quote.text, currentLang, cacheKey, dispatch]);

  // Trigger translation when needed
  useEffect(() => {
    if (needsTranslation) {
      translateQuote();
    }
  }, [needsTranslation, translateQuote]);

  // Return the appropriate text
  const translatedText = useMemo(() => {
    // If language is English or auto-translate is disabled, return original
    if (currentLang === "en" || !autoTranslate) {
      return quote.text;
    }
    // Return cached translation or original text while loading
    return cachedTranslation || quote.text;
  }, [currentLang, autoTranslate, cachedTranslation, quote.text]);

  const isTranslated = useMemo(() => {
    return currentLang !== "en" && autoTranslate && !!cachedTranslation;
  }, [currentLang, autoTranslate, cachedTranslation]);

  return {
    translatedText,
    isTranslating,
    isTranslated,
  };
}

export default useTranslatedQuote;
