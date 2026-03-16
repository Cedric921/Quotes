import { useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addTranslation,
  setQuoteLoading,
  removeQuoteLoading,
} from "../store/slices/translationSlice";
import { translateText } from "../services/translationService";
import { Topic } from "../types";

interface UseTranslatedTopicResult {
  translatedName: string;
  translatedTitle: string;
  translatedDescription: string;
  isTranslating: boolean;
  isTranslated: boolean;
}

/**
 * Hook to automatically translate a topic based on the current app language
 * @param topic - The topic to translate
 * @returns Object with translated name, title, description and loading state
 */
export function useTranslatedTopic(topic: Topic): UseTranslatedTopicResult {
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

  // Cache keys for each field
  const nameCacheKey = `topic:${topic.id}:name:${currentLang}`;
  const titleCacheKey = `topic:${topic.id}:title:${currentLang}`;
  const descCacheKey = `topic:${topic.id}:desc:${currentLang}`;

  const cachedName = translationCache[nameCacheKey];
  const cachedTitle = translationCache[titleCacheKey];
  const cachedDesc = translationCache[descCacheKey];

  const isTranslatingName = loadingQuotes.includes(nameCacheKey);
  const isTranslatingTitle = loadingQuotes.includes(titleCacheKey);
  const isTranslatingDesc = loadingQuotes.includes(descCacheKey);
  const isTranslating =
    isTranslatingName || isTranslatingTitle || isTranslatingDesc;

  // Check if translation is needed (topics are in French)
  const needsTranslation = useMemo(() => {
    return (
      autoTranslate &&
      currentLang !== "fr" &&
      (!cachedName || !cachedTitle) &&
      !isTranslating
    );
  }, [autoTranslate, currentLang, cachedName, cachedTitle, isTranslating]);

  // Translate the topic fields (topics are in French)
  const translateTopic = useCallback(async () => {
    if (!needsTranslation) return;

    // Translate name if not cached
    if (!cachedName && topic.name) {
      dispatch(setQuoteLoading(nameCacheKey));
      try {
        const translated = await translateText(topic.name, currentLang, "fr");
        if (translated && translated !== topic.name) {
          dispatch(
            addTranslation({ quoteId: nameCacheKey, translation: translated }),
          );
        } else {
          dispatch(removeQuoteLoading(nameCacheKey));
        }
      } catch (error) {
        console.error("Topic name translation error:", error);
        dispatch(removeQuoteLoading(nameCacheKey));
      }
    }

    // Translate title if not cached and different from name
    if (!cachedTitle && topic.title && topic.title !== topic.name) {
      dispatch(setQuoteLoading(titleCacheKey));
      try {
        const translated = await translateText(topic.title, currentLang, "fr");
        if (translated && translated !== topic.title) {
          dispatch(
            addTranslation({ quoteId: titleCacheKey, translation: translated }),
          );
        } else {
          dispatch(removeQuoteLoading(titleCacheKey));
        }
      } catch (error) {
        console.error("Topic title translation error:", error);
        dispatch(removeQuoteLoading(titleCacheKey));
      }
    }

    // Translate description if not cached
    if (!cachedDesc && topic.description) {
      dispatch(setQuoteLoading(descCacheKey));
      try {
        const translated = await translateText(
          topic.description,
          currentLang,
          "fr",
        );
        if (translated && translated !== topic.description) {
          dispatch(
            addTranslation({ quoteId: descCacheKey, translation: translated }),
          );
        } else {
          dispatch(removeQuoteLoading(descCacheKey));
        }
      } catch (error) {
        console.error("Topic description translation error:", error);
        dispatch(removeQuoteLoading(descCacheKey));
      }
    }
  }, [
    needsTranslation,
    topic.name,
    topic.title,
    topic.description,
    currentLang,
    nameCacheKey,
    titleCacheKey,
    descCacheKey,
    cachedName,
    cachedTitle,
    cachedDesc,
    dispatch,
  ]);

  // Trigger translation when needed
  useEffect(() => {
    if (needsTranslation) {
      translateTopic();
    }
  }, [needsTranslation, translateTopic]);

  // Return the appropriate text
  // Return the appropriate text (topics are in French)
  const translatedName = useMemo(() => {
    if (currentLang === "fr" || !autoTranslate) {
      return topic.name;
    }
    return cachedName || topic.name;
  }, [currentLang, autoTranslate, cachedName, topic.name]);

  const translatedTitle = useMemo(() => {
    if (currentLang === "fr" || !autoTranslate) {
      return topic.title || topic.name;
    }
    // Use cached title, or fall back to cached name, or original
    return cachedTitle || cachedName || topic.title || topic.name;
  }, [
    currentLang,
    autoTranslate,
    cachedTitle,
    cachedName,
    topic.title,
    topic.name,
  ]);

  const translatedDescription = useMemo(() => {
    if (currentLang === "fr" || !autoTranslate || !topic.description) {
      return topic.description || "";
    }
    return cachedDesc || topic.description || "";
  }, [currentLang, autoTranslate, cachedDesc, topic.description]);

  const isTranslated = useMemo(() => {
    return (
      currentLang !== "fr" && autoTranslate && (!!cachedName || !!cachedTitle)
    );
  }, [currentLang, autoTranslate, cachedName, cachedTitle]);

  return {
    translatedName,
    translatedTitle,
    translatedDescription,
    isTranslating,
    isTranslated,
  };
}

export default useTranslatedTopic;
