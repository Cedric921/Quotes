import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import subscriptionReducer from "./slices/subscriptionSlice";
import fontReducer from "./slices/fontSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    subscription: subscriptionReducer,
    font: fontReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
