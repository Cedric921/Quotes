import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TranslationState {
  // Enable/disable automatic translation
  autoTranslate: boolean;
  // In-memory cache for current session (key: quoteId, value: translated text)
  translationCache: Record<string, string>;
  // Track which quotes are currently being translated
  loadingQuotes: string[];
}

const initialState: TranslationState = {
  autoTranslate: true, // Enabled by default
  translationCache: {},
  loadingQuotes: [],
};

const translationSlice = createSlice({
  name: "translation",
  initialState,
  reducers: {
    setAutoTranslate: (state, action: PayloadAction<boolean>) => {
      state.autoTranslate = action.payload;
      // Clear cache when disabling to free memory
      if (!action.payload) {
        state.translationCache = {};
      }
    },
    addTranslation: (
      state,
      action: PayloadAction<{ quoteId: string; translation: string }>,
    ) => {
      const { quoteId, translation } = action.payload;
      state.translationCache[quoteId] = translation;
      // Remove from loading
      state.loadingQuotes = state.loadingQuotes.filter((id) => id !== quoteId);
    },
    setQuoteLoading: (state, action: PayloadAction<string>) => {
      if (!state.loadingQuotes.includes(action.payload)) {
        state.loadingQuotes.push(action.payload);
      }
    },
    removeQuoteLoading: (state, action: PayloadAction<string>) => {
      state.loadingQuotes = state.loadingQuotes.filter(
        (id) => id !== action.payload,
      );
    },
    clearTranslationCache: (state) => {
      state.translationCache = {};
      state.loadingQuotes = [];
    },
  },
});

export const {
  setAutoTranslate,
  addTranslation,
  setQuoteLoading,
  removeQuoteLoading,
  clearTranslationCache,
} = translationSlice.actions;

export default translationSlice.reducer;

