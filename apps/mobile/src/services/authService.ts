import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";
import { resetAndNavigate } from "./navigationService";
import { queryClient } from "../api/queryClient";

let isLoggingOut = false;

/**
 * Handle token expiration - logout user and redirect to login
 */
export const handleTokenExpired = async () => {
  // Prevent multiple logout calls
  if (isLoggingOut) return;
  isLoggingOut = true;

  try {
    console.log("Token expired, logging out...");

    // Clear stored auth data
    await AsyncStorage.removeItem("@focus_auth_token");
    await AsyncStorage.removeItem("@focus_user_data");

    // Clear Redux state
    store.dispatch(logout());

    // Clear React Query cache
    queryClient.clear();

    // Show toast message
    Toast.show({
      type: "error",
      text1: "Session expirée",
      text2: "Veuillez vous reconnecter",
      position: "top",
      visibilityTime: 4000,
    });

    // Navigate to login screen
    setTimeout(() => {
      resetAndNavigate("Login");
      isLoggingOut = false;
    }, 500);
  } catch (error) {
    console.error("Error during logout:", error);
    isLoggingOut = false;
  }
};

/**
 * Check if an error is a 401 Unauthorized error
 */
export const isUnauthorizedError = (error: any): boolean => {
  return (
    error?.response?.status === 401 ||
    error?.status === 401 ||
    (typeof error === "string" && error.includes("401"))
  );
};

