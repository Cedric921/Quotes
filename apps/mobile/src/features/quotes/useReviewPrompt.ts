import { useCallback } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";

const STORAGE_KEY = "@focus_review_prompt";

/** Quotes read before the app is allowed to ask for a review. */
const QUOTES_THRESHOLD = 15;

/** And how long it must wait before asking again. */
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

const getState = async (): Promise<ReviewState> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
};

const setState = async (patch: Partial<ReviewState>): Promise<void> => {
  try {
    const next = { ...(await getState()), ...patch };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Asking for a review is the least important thing the app does.
  }
};

/**
 * The store review prompt, asked at a moment the user might say yes.
 *
 * v1 counted quotes read and asked at fifteen, then waited three months. The
 * v2 feed never counted anything, so the only way left to review Focus was to
 * find the row in settings. This is v1's rule, moved next to the feed that
 * feeds it.
 *
 * The count resets after each prompt: on iOS the system decides whether the
 * dialog actually appears and never tells us, so "has reviewed" can only be
 * assumed on Android.
 */
export function useReviewPrompt() {
  return useCallback(async () => {
    const state = await getState();
    if (state.hasReviewed) return;

    const quotesViewed = state.quotesViewed + 1;
    await setState({ quotesViewed });
    if (quotesViewed < QUOTES_THRESHOLD) return;

    const now = Date.now();
    const cooldown = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    if (state.lastPromptAt && now - state.lastPromptAt < cooldown) return;

    try {
      if (!(await StoreReview.isAvailableAsync())) return;
      if (!(await StoreReview.hasAction())) return;

      await StoreReview.requestReview();
      await setState({
        lastPromptAt: now,
        quotesViewed: 0,
        hasReviewed: Platform.OS !== "ios",
      });
    } catch (error) {
      console.log("[useReviewPrompt] Error requesting review:", error);
    }
  }, []);
}
