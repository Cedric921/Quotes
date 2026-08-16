import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@focus_streak_v2";

export interface StreakState {
  count: number;
  /** ISO dates (yyyy-mm-dd, local time) of the last fourteen days marked as read. */
  days: string[];
  lastSeen?: string;
  tracking: boolean;
  /** Set for one render when the streak has just advanced, to fire the toast. */
  justAdvanced: boolean;
  /**
   * True once the stored streak has been read back. Until then a visit must
   * not be recorded: the feed used to mark today against the empty initial
   * state, then the stored copy arrived and overwrote it — so the count sat
   * at one forever.
   */
  hydrated: boolean;
}

const initialState: StreakState = {
  count: 0,
  days: [],
  tracking: true,
  justAdvanced: false,
  hydrated: false,
};

/** How many marked days are kept — enough to fill the week on display. */
const KEPT_DAYS = 14;

/**
 * The calendar date where the user is, not in UTC: `toISOString` rolled the
 * day over at midnight UTC, which for a reader in Paris was 1 or 2 a.m., and
 * in Montréal the evening before.
 */
export const localIsoDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

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
      const today = action.payload ?? localIsoDate(new Date());
      if (state.lastSeen === today || state.days.includes(today)) {
        state.justAdvanced = false;
        return;
      }
      state.count =
        state.lastSeen && isYesterday(state.lastSeen, today)
          ? state.count + 1
          : 1;
      state.lastSeen = today;
      state.days = [...state.days, today].slice(-KEPT_DAYS);
      state.justAdvanced = true;
    },
    toastShown: (state) => {
      state.justAdvanced = false;
    },
    setTracking: (state, action: PayloadAction<boolean>) => {
      state.tracking = action.payload;
    },
    hydrate: (state, action: PayloadAction<Partial<StreakState>>) => {
      Object.assign(state, action.payload, {
        justAdvanced: false,
        hydrated: true,
      });
    },
  },
});

export const { markSeen, toastShown, setTracking, hydrate } =
  streakSlice.actions;
export default streakSlice.reducer;

type Dispatch = (action: unknown) => void;
type GetState = () => { streak: StreakState };

export const loadStreak = () => async (dispatch: Dispatch) => {
  let stored: Partial<StreakState> = {};
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) stored = JSON.parse(raw) as Partial<StreakState>;
  } catch {
    // Non-fatal: a lost streak is better than a crashed launch.
  }
  // Dispatched even when nothing was stored, so the feed knows it may record.
  dispatch(hydrate(stored));
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
