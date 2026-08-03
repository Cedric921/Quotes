import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@focus_like_quota_v2";

/** Free tier: five favourites, which is also what personalises the feed. */
export const FREE_LIKE_QUOTA = 5;

export interface LikeQuotaState {
  used: number;
  hydrated: boolean;
}

const initialState: LikeQuotaState = { used: 0, hydrated: false };

const likeQuotaSlice = createSlice({
  name: "likeQuota",
  initialState,
  reducers: {
    increment: (state) => {
      state.used += 1;
    },
    decrement: (state) => {
      state.used = Math.max(0, state.used - 1);
    },
    hydrate: (state, action: PayloadAction<number>) => {
      state.used = action.payload;
      state.hydrated = true;
    },
  },
});

export const { increment, decrement, hydrate } = likeQuotaSlice.actions;
export default likeQuotaSlice.reducer;

type Dispatch = (action: unknown) => void;
type GetState = () => { likeQuota: LikeQuotaState };

export const loadLikeQuota = () => async (dispatch: Dispatch) => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    dispatch(hydrate(raw ? Number(raw) || 0 : 0));
  } catch {
    dispatch(hydrate(0));
  }
};

/**
 * Client-side until the API carries the quota (spec §8). Keeping it behind a
 * thunk means the screens never learn where the number lives.
 */
export const persistLikeQuota =
  () => async (_dispatch: Dispatch, getState: GetState) => {
    try {
      await AsyncStorage.setItem(KEY, String(getState().likeQuota.used));
    } catch {
      // ignore
    }
  };
