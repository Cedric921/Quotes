import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { store } from "./src/store";
import { queryClient } from "./src/api/queryClient";
import { loadStoredAuth } from "./src/store/slices/authSlice";
import "./src/i18n"; // Initialiser i18n

function AppContent() {
  useEffect(() => {
    // Load stored authentication on app start
    store.dispatch(loadStoredAuth());
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
