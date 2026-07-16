import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Platform, AppState } from "react-native";
import { Provider, useSelector } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { store, RootState } from "./src/store";
import { queryClient } from "./src/api/queryClient";
import { quoteKeys } from "./src/api/hooks/useQuotes";
import { loadStoredAuth } from "./src/store/slices/authSlice";
import { loadStoredTheme } from "./src/store/slices/themeSlice";
import { loadStoredFont } from "./src/store/slices/fontSlice";
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
import "./src/i18n"; // Initialiser i18n

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
    // Load stored authentication, theme and font on app start
    store.dispatch(loadStoredAuth());
    store.dispatch(loadStoredTheme());
    store.dispatch(loadStoredFont());

    // Setup notification channel for Android
    setupNotificationChannel();

    // Initialize RevenueCat SDK (without user ID initially)
    initializePurchases();

    // Start subscription status sync (checks every 5 minutes)
    startSubscriptionSync();

    // Cleanup on unmount
    return () => {
      stopSubscriptionSync();
    };
  }, []);

  useEffect(() => {
    // Sync RevenueCat user when authentication changes
    const syncRevenueCatUser = async () => {
      const currentUserId = user?.id || null;

      // Only sync if user ID changed
      if (currentUserId !== prevUserIdRef.current) {
        try {
          if (currentUserId) {
            // User logged in - link to RevenueCat
            await loginUser(currentUserId);
          } else if (prevUserIdRef.current) {
            // User logged out - switch to anonymous
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
      const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
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

        // Check subscription status when app returns to foreground
        import("./src/services/subscriptionSyncService").then(({ checkSubscriptionStatus }) => {
          checkSubscriptionStatus();
        });
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.container}>
      <AppNavigator />
      <StatusBar style="light" />
    </View>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
