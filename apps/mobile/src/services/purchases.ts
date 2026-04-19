import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from "react-native-purchases";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Get RevenueCat API keys from config
const REVENUECAT_API_KEY_IOS =
  Constants.expoConfig?.extra?.REVENUECAT_API_KEY_IOS || "";
const REVENUECAT_API_KEY_ANDROID =
  Constants.expoConfig?.extra?.REVENUECAT_API_KEY_ANDROID || "";

/**
 * Initialize RevenueCat SDK
 * Should be called once at app startup
 */
export const initializePurchases = async (userId?: string): Promise<void> => {
  const apiKey =
    Platform.OS === "ios" ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

  if (!apiKey) {
    console.warn(
      "[Purchases] RevenueCat API key not configured for",
      Platform.OS
    );
    return;
  }

  try {
    // Enable debug logs in development
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    // Configure with user ID if available
    if (userId) {
      await Purchases.configure({ apiKey, appUserID: userId });
    } else {
      await Purchases.configure({ apiKey });
    }

    console.log("[Purchases] RevenueCat initialized successfully");
  } catch (error) {
    console.error("[Purchases] Failed to initialize:", error);
  }
};

/**
 * Login user to RevenueCat (link purchases to user account)
 */
export const loginUser = async (userId: string): Promise<CustomerInfo> => {
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    console.log("[Purchases] User logged in:", userId);
    return customerInfo;
  } catch (error) {
    console.error("[Purchases] Login failed:", error);
    throw error;
  }
};

/**
 * Logout user from RevenueCat (anonymous mode)
 */
export const logoutUser = async (): Promise<CustomerInfo> => {
  try {
    const customerInfo = await Purchases.logOut();
    console.log("[Purchases] User logged out");
    return customerInfo;
  } catch (error) {
    console.error("[Purchases] Logout failed:", error);
    throw error;
  }
};

/**
 * Get current offerings (products available for purchase)
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error("[Purchases] Failed to get offerings:", error);
    return null;
  }
};

/**
 * Get all available packages
 */
export const getPackages = async (): Promise<PurchasesPackage[]> => {
  const offering = await getOfferings();
  return offering?.availablePackages || [];
};

/**
 * Purchase a package
 */
export const purchasePackage = async (
  pkg: PurchasesPackage
): Promise<CustomerInfo> => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    console.log("[Purchases] Purchase successful");
    return customerInfo;
  } catch (error: any) {
    if (error.userCancelled) {
      console.log("[Purchases] User cancelled purchase");
    } else {
      console.error("[Purchases] Purchase failed:", error);
    }
    throw error;
  }
};

/**
 * Restore previous purchases
 */
export const restorePurchases = async (): Promise<CustomerInfo> => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    console.log("[Purchases] Purchases restored");
    return customerInfo;
  } catch (error) {
    console.error("[Purchases] Restore failed:", error);
    throw error;
  }
};

/**
 * Get current customer info (entitlements)
 */
export const getCustomerInfo = async (): Promise<CustomerInfo> => {
  return await Purchases.getCustomerInfo();
};

/**
 * Check if user has active premium entitlement
 */
export const isPremiumActive = async (): Promise<boolean> => {
  const customerInfo = await getCustomerInfo();
  // Check for "premium" entitlement (configure this name in RevenueCat dashboard)
  return customerInfo.entitlements.active["premium"] !== undefined;
};

/**
 * Add listener for customer info updates
 */
export const addCustomerInfoListener = (
  listener: (customerInfo: CustomerInfo) => void
): (() => void) => {
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => {
    // RevenueCat SDK handles cleanup internally
  };
};

