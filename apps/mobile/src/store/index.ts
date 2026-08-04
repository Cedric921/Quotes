import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import subscriptionReducer from "./slices/subscriptionSlice";
import fontReducer from "./slices/fontSlice";
import translationReducer from "./slices/translationSlice";
import onboardingReducer from "../features/onboarding/store/onboardingSlice";
import streakReducer from "../features/streak/streakSlice";
import likeQuotaReducer from "../features/quotes/likeQuotaSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    subscription: subscriptionReducer,
    font: fontReducer,
    translation: translationReducer,
    // v2: onboarding funnel state, daily streak and the free like quota.
    // The last two are client-side placeholders for API fields that do not
    // exist yet — see docs/DESIGN_SYSTEM_V2.md §8.
    onboarding: onboardingReducer,
    streak: streakReducer,
    likeQuota: likeQuotaReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
