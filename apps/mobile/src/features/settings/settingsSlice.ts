import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@focus_settings_v2";

/**
 * The "about you" answers plus the personalisation switches.
 *
 * These are the same values the onboarding funnel collects — settings is where
 * the user corrects them later, so both write here and the funnel seeds it on
 * completion. Single-value fields hold an id; multi-value fields hold ids.
 */
export interface SettingsState {
  /**
   * The name the user gave the funnel. It lives here, not only on the API
   * user, because v2 has no sign-in gate: most people reading quotes have no
   * account, and the name still has to survive and still has to be editable.
   */
  name?: string;
  gender?: string;
  age?: string;
  relationship?: string;
  beliefs?: string;
  /** Explicit locale override; undefined follows the device. */
  language?: string;
  sound: boolean;
  /** Topic ids the user wants more of. */
  contentPreferences: string[];
  /** Topic ids to keep out of the feed entirely. */
  mutedTopics: string[];
  analytics: boolean;
  hydrated: boolean;
}

const initialState: SettingsState = {
  sound: true,
  contentPreferences: [],
  mutedTopics: [],
  analytics: true,
  hydrated: false,
};

type Single = "name" | "gender" | "age" | "relationship" | "beliefs" | "language";
type Multi = "contentPreferences" | "mutedTopics";

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setChoice: (
      state,
      action: PayloadAction<{ field: Single; value: string }>,
    ) => {
      state[action.payload.field] = action.payload.value;
    },
    toggleChoice: (
      state,
      action: PayloadAction<{ field: Multi; value: string }>,
    ) => {
      const { field, value } = action.payload;
      state[field] = state[field].includes(value)
        ? state[field].filter((x) => x !== value)
        : [...state[field], value];
    },
    setSound: (state, action: PayloadAction<boolean>) => {
      state.sound = action.payload;
    },
    setAnalytics: (state, action: PayloadAction<boolean>) => {
      state.analytics = action.payload;
    },
    /**
     * Carry the funnel's answers over, once.
     *
     * Only empty fields are filled: the funnel runs before settings exist, but
     * a re-run must never quietly undo a correction the user made afterwards.
     */
    seedFromOnboarding: (
      state,
      action: PayloadAction<{
        name?: string;
        age?: string;
        beliefs?: string;
        topicIds?: string[];
      }>,
    ) => {
      const { name, age, beliefs, topicIds } = action.payload;
      if (name && !state.name) state.name = name;
      if (age && !state.age) state.age = age;
      if (beliefs && !state.beliefs) state.beliefs = beliefs;
      if (topicIds?.length && state.contentPreferences.length === 0) {
        state.contentPreferences = topicIds;
      }
    },
    hydrate: (state, action: PayloadAction<Partial<SettingsState>>) => {
      Object.assign(state, action.payload, { hydrated: true });
    },
  },
});

export const {
  setChoice,
  toggleChoice,
  setSound,
  setAnalytics,
  seedFromOnboarding,
  hydrate,
} = settingsSlice.actions;
export default settingsSlice.reducer;

type Dispatch = (action: unknown) => void;
type GetState = () => { settings: SettingsState };

export const loadSettings = () => async (dispatch: Dispatch) => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    dispatch(hydrate(raw ? (JSON.parse(raw) as Partial<SettingsState>) : {}));
  } catch {
    dispatch(hydrate({}));
  }
};

export const persistSettings =
  () => async (_dispatch: Dispatch, getState: GetState) => {
    const { hydrated, ...rest } = getState().settings;
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(rest));
    } catch {
      // Settings are a convenience; a failed write never blocks the user.
    }
  };
