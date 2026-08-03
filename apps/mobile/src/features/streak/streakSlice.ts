import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@focus_streak_v2";

export interface StreakState {
  count: number;
  /** ISO dates (yyyy-mm-dd) of the last seven days marked as read. */
  days: string[];
  lastSeen?: string;
  tracking: boolean;
  /** Set for one render when the streak has just advanced, to fire the toast. */
  justAdvanced: boolean;
}

const initialState: StreakState = {
  count: 0,
  days: [],
  tracking: true,
  justAdvanced: false,
};

const iso = (d: Date) => d.toISOString().slice(0, 10);

const isYesterday = (a: string, b: string) => {
  const diff = (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000;
  return Math.round(diff) === 1;
};

const streakSlice = createSlice({
  name: "streak",
  initialState,
  reducers: {
    /**
     * Called once per app open, from the feed.
     *
     * Same day → nothing. Yesterday → continue. Any older → the streak broke
     * and we restart at one rather than at zero, because the user did open
     * the app today.
     */
    markSeen: (state, action: PayloadAction<string | undefined>) => {
      const today = action.payload ?? iso(new Date());
      if (state.lastSeen === today) {
        state.justAdvanced = false;
        return;
      }
      state.count =
        state.lastSeen && isYesterday(state.lastSeen, today)
          ? state.count + 1
          : 1;
      state.lastSeen = today;
      state.days = [...state.days, today].slice(-7);
      state.justAdvanced = true;
    },
    toastShown: (state) => {
      state.justAdvanced = false;
    },
    setTracking: (state, action: PayloadAction<boolean>) => {
      state.tracking = action.payload;
    },
    hydrate: (state, action: PayloadAction<Partial<StreakState>>) => {
      Object.assign(state, action.payload, { justAdvanced: false });
    },
  },
});

export const { markSeen, toastShown, setTracking, hydrate } =
  streakSlice.actions;
export default streakSlice.reducer;

type Dispatch = (action: unknown) => void;
type GetState = () => { streak: StreakState };

export const loadStreak = () => async (dispatch: Dispatch) => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) dispatch(hydrate(JSON.parse(raw) as Partial<StreakState>));
  } catch {
    // Non-fatal: a lost streak is better than a crashed launch.
  }
};

/**
 * Client-side for now. The back end has no streak table yet (see spec §8);
 * when it does, only this thunk changes.
 */
export const persistStreak =
  () => async (_dispatch: Dispatch, getState: GetState) => {
    const { count, days, lastSeen, tracking } = getState().streak;
    try {
      await AsyncStorage.setItem(
        KEY,
        JSON.stringify({ count, days, lastSeen, tracking }),
      );
    } catch {
      // ignore
    }
  };
