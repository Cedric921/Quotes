import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";
import { resetAndNavigate } from "./navigationService";
import i18n from "../i18n";
import { queryClient } from "../api/queryClient";
import { clearAuthTokenCache } from "./authTokenCache";

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
    clearAuthTokenCache();

    // Clear Redux state
    store.dispatch(logout());

    // Clear React Query cache
    queryClient.clear();

    // Show toast message
    Toast.show({
      type: "error",
      text1: i18n.t("auth.sessionExpired"),
      text2: i18n.t("auth.sessionExpiredMessage"),
      position: "top",
      visibilityTime: 4000,
    });

    // v2 has no login gate: the feed reads fine without an account, so an
    // expired token drops the user back on it rather than on a sign-in wall.
    // Signing in again is a settings row away.
    setTimeout(() => {
      resetAndNavigate("Feed");
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

