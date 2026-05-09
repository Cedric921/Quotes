import { useCallback } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";

const STORAGE_KEY = "@focus_review_prompt";
const QUOTES_THRESHOLD = 15;
const COOLDOWN_DAYS = 90;

interface ReviewState {
  quotesViewed: number;
  lastPromptAt: number | null;
  hasReviewed: boolean;
}

const DEFAULT_STATE: ReviewState = {
  quotesViewed: 0,
  lastPromptAt: null,
  hasReviewed: false,
};

async function getState(): Promise<ReviewState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

async function setState(state: Partial<ReviewState>): Promise<void> {
  try {
    const current = await getState();
    const next = { ...current, ...state };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

/**
 * Hook to trigger the native App Store / Play Store review prompt.
 * Tracks how many quotes the user has viewed and only prompts once they
 * reach a threshold and after a cooldown period.
 */
export function useReviewPrompt() {
  const recordQuoteViewed = useCallback(async () => {
    const state = await getState();
    if (state.hasReviewed) return;

    const newCount = state.quotesViewed + 1;
    await setState({ quotesViewed: newCount });

    if (newCount < QUOTES_THRESHOLD) return;

    const now = Date.now();
    const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    if (state.lastPromptAt && now - state.lastPromptAt < cooldownMs) return;

    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (!isAvailable) return;
      const hasAction = await StoreReview.hasAction();
      if (!hasAction) return;

      await StoreReview.requestReview();
      await setState({
        lastPromptAt: now,
        quotesViewed: 0,
        hasReviewed: Platform.OS === "ios" ? false : true,
      });
    } catch (error) {
      console.log("[useReviewPrompt] Error requesting review:", error);
    }
  }, []);

  const resetReviewState = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return { recordQuoteViewed, resetReviewState };
}
