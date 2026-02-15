import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { Provider, useSelector } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { store, RootState } from "./src/store";
import { queryClient } from "./src/api/queryClient";
import { loadStoredAuth } from "./src/store/slices/authSlice";
import { loadStoredTheme } from "./src/store/slices/themeSlice";
import { useTrackActivity } from "./src/api/hooks/useUserActivity";
import { setupNotificationChannel } from "./src/services/notificationService";
import "./src/i18n"; // Initialiser i18n

function AppContent() {
  const token = useSelector((state: RootState) => state.auth.token);
  const trackActivity = useTrackActivity();

  useEffect(() => {
    // Load stored authentication and theme on app start
    store.dispatch(loadStoredAuth());
    store.dispatch(loadStoredTheme());

    // Setup notification channel for Android
    setupNotificationChannel();
  }, []);

  useEffect(() => {
    // Track daily activity when user is authenticated
    if (token) {
      const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
      trackActivity.mutate(today);
    }
  }, [token]);

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
