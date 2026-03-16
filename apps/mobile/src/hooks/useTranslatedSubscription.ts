import { useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addTranslation,
  setQuoteLoading,
  removeQuoteLoading,
} from "../store/slices/translationSlice";
import { translateText } from "../services/translationService";
import { SubscriptionPlan } from "../store/slices/subscriptionSlice";

interface TranslatedPlan {
  name: string;
  description: string;
}

interface UseTranslatedSubscriptionResult {
  translatedPlan: TranslatedPlan;
  isTranslating: boolean;
  isTranslated: boolean;
}

/**
 * Hook to automatically translate a subscription plan based on the current app language
 * @param plan - The subscription plan to translate
 * @returns Object with translated fields and loading state
 */
export function useTranslatedSubscription(
  plan: SubscriptionPlan,
): UseTranslatedSubscriptionResult {
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
  const nameCacheKey = `plan-name:${plan.id}:${currentLang}`;
  const descCacheKey = `plan-desc:${plan.id}:${currentLang}`;

  const cachedName = translationCache[nameCacheKey];
  const cachedDesc = translationCache[descCacheKey];

  const isTranslatingName = loadingQuotes.includes(nameCacheKey);
  const isTranslatingDesc = loadingQuotes.includes(descCacheKey);
  const isTranslating = isTranslatingName || isTranslatingDesc;

  // Check if translation is needed
  const needsTranslation = useMemo(() => {
    return (
      autoTranslate &&
      currentLang !== "fr" &&
      (!cachedName || !cachedDesc) &&
      !isTranslating
    );
  }, [autoTranslate, currentLang, cachedName, cachedDesc, isTranslating]);

  // Translate the plan
  const translatePlan = useCallback(async () => {
    if (!needsTranslation) return;

    // Translate name
    if (!cachedName && !isTranslatingName) {
      dispatch(setQuoteLoading(nameCacheKey));
      try {
        const translated = await translateText(plan.name, currentLang, "fr");
        if (translated && translated !== plan.name) {
          dispatch(
            addTranslation({ quoteId: nameCacheKey, translation: translated }),
          );
        } else {
          dispatch(removeQuoteLoading(nameCacheKey));
        }
      } catch (error) {
        console.error("Translation error (name):", error);
        dispatch(removeQuoteLoading(nameCacheKey));
      }
    }

    // Translate description
    if (plan.description && !cachedDesc && !isTranslatingDesc) {
      dispatch(setQuoteLoading(descCacheKey));
      try {
        const translated = await translateText(
          plan.description,
          currentLang,
          "fr",
        );
        if (translated && translated !== plan.description) {
          dispatch(
            addTranslation({ quoteId: descCacheKey, translation: translated }),
          );
        } else {
          dispatch(removeQuoteLoading(descCacheKey));
        }
      } catch (error) {
        console.error("Translation error (description):", error);
        dispatch(removeQuoteLoading(descCacheKey));
      }
    }
  }, [
    needsTranslation,
    plan.name,
    plan.description,
    currentLang,
    nameCacheKey,
    descCacheKey,
    cachedName,
    cachedDesc,
    isTranslatingName,
    isTranslatingDesc,
    dispatch,
  ]);

  // Trigger translation when needed
  useEffect(() => {
    if (needsTranslation) {
      translatePlan();
    }
  }, [needsTranslation, translatePlan]);

  // Return the appropriate text
  const translatedPlan = useMemo<TranslatedPlan>(() => {
    if (currentLang === "fr" || !autoTranslate) {
      return {
        name: plan.name,
        description: plan.description || "",
      };
    }
    return {
      name: cachedName || plan.name,
      description: cachedDesc || plan.description || "",
    };
  }, [currentLang, autoTranslate, cachedName, cachedDesc, plan.name, plan.description]);

  const isTranslated = useMemo(() => {
    return currentLang !== "fr" && autoTranslate && (!!cachedName || !!cachedDesc);
  }, [currentLang, autoTranslate, cachedName, cachedDesc]);

  return {
    translatedPlan,
    isTranslating,
    isTranslated,
  };
}

export default useTranslatedSubscription;

