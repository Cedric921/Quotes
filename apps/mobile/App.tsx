import { StatusBar } from "expo-status-bar";
import { Platform, AppState, LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider, useSelector } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { ThemeProvider } from "./src/theme";
import { store, RootState } from "./src/store";
import { queryClient } from "./src/api/queryClient";
import { quoteKeys } from "./src/api/hooks/useQuotes";
import { loadStoredAuth } from "./src/store/slices/authSlice";
import { loadStoredTheme } from "./src/store/slices/themeSlice";
import { loadStoredFont } from "./src/store/slices/fontSlice";
import { loadSettings } from "./src/features/settings/settingsSlice";
import { useTrackActivity } from "./src/api/hooks/useUserActivity";
import { setupNotificationChannel } from "./src/services/notificationService";
import {
  initializePurchases,
  loginUser,
  logoutUser,
} from "./src/services/purchases";
import { refreshShuffleSeed } from "./src/services/api";
import {
  startSubscriptionSync,
  stopSubscriptionSync,
} from "./src/services/subscriptionSyncService";
import { startKeepAlive, stopKeepAlive } from "./src/services/keepAliveService";
import "./src/i18n";

// A simulator has no StoreKit configuration, so RevenueCat cannot load its
// offerings and says so on every launch — as a red toast over the first screen
// of any demo or screen recording. The paywall already handles the missing
// offering (it shows "—"), so the toast adds nothing. Dev-only: LogBox does
// not exist in release builds.
LogBox.ignoreLogs([
  /\[RevenueCat\]/,
  /\[Purchases\] Failed to get offerings/,
  /Require cycle: src\/services\/api\.ts/,
]);

// Register Android widget task handler
if (Platform.OS === "android") {
  import("react-native-android-widget")
    .then(({ registerWidgetTaskHandler }) => {
      import("./src/widgets/widgetTaskHandler").then(
        ({ widgetTaskHandler }) => {
          registerWidgetTaskHandler(widgetTaskHandler);
        },
      );
    })
    .catch(() => {
      // Widget module not available (e.g., in Expo Go)
      console.log("[App] Android widget module not available");
    });
}

function AppContent() {
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const trackActivity = useTrackActivity();
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Load stored authentication, theme, font and user settings on app start.
    // The v2 slices (onboarding, streak, like quota) hydrate inside
    // RootNavigator, which is what gates the first render on them.
    store.dispatch(loadStoredAuth());
    store.dispatch(loadStoredTheme());
    store.dispatch(loadStoredFont());
    store.dispatch(loadSettings());

    setupNotificationChannel();
    initializePurchases();
    startSubscriptionSync();
    startKeepAlive();

    return () => {
      stopSubscriptionSync();
      stopKeepAlive();
    };
  }, []);

  useEffect(() => {
    // Sync RevenueCat user when authentication changes
    const syncRevenueCatUser = async () => {
      const currentUserId = user?.id || null;

      if (currentUserId !== prevUserIdRef.current) {
        // Everything cached was fetched as somebody else — as a guest before
        // signing in, or as this user before signing out. The feed's `isLiked`
        // flags are the visible half of that: without this, a fresh sign-in
        // shows five minutes of hearts belonging to nobody.
        if (prevUserIdRef.current !== null || currentUserId !== null) {
          queryClient.invalidateQueries();
        }

        try {
          if (currentUserId) {
            await loginUser(currentUserId);
          } else if (prevUserIdRef.current) {
            await logoutUser();
          }
        } catch (error) {
          console.error("[App] RevenueCat user sync failed:", error);
        }
        prevUserIdRef.current = currentUserId;
      }
    };

    syncRevenueCatUser();
  }, [user?.id]);

  useEffect(() => {
    // Track daily activity when user is authenticated
    if (token) {
      const today = new Date().toISOString().split("T")[0];
      trackActivity.mutate(today);
    }
  }, [token]);

  // Reshuffle quotes each time the app returns to the foreground so the user
  // does not land on the same quotes after closing and reopening the app.
  // Also check subscription status when app becomes active again.
  const appStateRef = useRef(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;
      if (
        (prev === "background" || prev === "inactive") &&
        nextState === "active"
      ) {
        refreshShuffleSeed();
        queryClient.invalidateQueries({ queryKey: quoteKeys.all });

        import("./src/services/subscriptionSyncService").then(
          ({ checkSubscriptionStatus }) => {
            checkSubscriptionStatus();
          },
        );
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <>
      <RootNavigator />
      <StatusBar style="light" />
    </>
  );
}

/**
 * Provider order matters:
 *
 *   GestureHandlerRootView  — must be the outermost native view, or the feed's
 *                             vertical pager and the sheets lose their gestures
 *   SafeAreaProvider        — `Screen` and `Sheet` read insets from it
 *   Provider (redux)        — ThemeProvider reads the selected font from the store
 *   QueryClientProvider
 *   ThemeProvider           — must sit inside redux, outside every screen
 */
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </QueryClientProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
