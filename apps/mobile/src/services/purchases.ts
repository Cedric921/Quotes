import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from "react-native-purchases";
import { Platform } from "react-native";
import Constants from "expo-constants";

// RevenueCat API keys from environment variables (app.config.js extra)
const REVENUECAT_API_KEY_IOS =
  Constants.expoConfig?.extra?.REVENUECAT_API_KEY_IOS || "";
const REVENUECAT_API_KEY_ANDROID =
  Constants.expoConfig?.extra?.REVENUECAT_API_KEY_ANDROID || "";

// Entitlement identifier (configured in RevenueCat dashboard)
export const ENTITLEMENT_ID = "Focus Pro";

let isConfigured = false;

const getApiKey = (): string =>
  Platform.OS === "ios" ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

const ensureConfigured = (userId?: string): boolean => {
  if (isConfigured) return true;
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn(
      "[Purchases] RevenueCat API key not configured for",
      Platform.OS,
    );
    return false;
  }
  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.ERROR);
    if (userId) {
      Purchases.configure({ apiKey, appUserID: userId });
    } else {
      Purchases.configure({ apiKey });
    }
    isConfigured = true;
    console.log("[Purchases] RevenueCat configured for", Platform.OS);
    return true;
  } catch (error) {
    console.error("[Purchases] Failed to configure:", error);
    return false;
  }
};

/**
 * Initialize RevenueCat SDK
 * Should be called once at app startup
 */
export const initializePurchases = async (userId?: string): Promise<void> => {
  ensureConfigured(userId);
};

/**
 * Login user to RevenueCat (link purchases to user account)
 */
export const loginUser = async (userId: string): Promise<CustomerInfo> => {
  if (!ensureConfigured(userId)) {
    throw new Error("[Purchases] SDK not configured (missing API key)");
  }
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
  if (!ensureConfigured()) {
    throw new Error("[Purchases] SDK not configured (missing API key)");
  }
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
  if (!ensureConfigured()) return null;
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
  pkg: PurchasesPackage,
): Promise<CustomerInfo> => {
  if (!ensureConfigured()) {
    throw new Error("[Purchases] SDK not configured (missing API key)");
  }
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
  if (!ensureConfigured()) {
    throw new Error("[Purchases] SDK not configured (missing API key)");
  }
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
  if (!ensureConfigured()) {
    throw new Error("[Purchases] SDK not configured (missing API key)");
  }
  return await Purchases.getCustomerInfo();
};

/**
 * Check if user has active premium entitlement (Focus Pro)
 */
export const isPremiumActive = async (): Promise<boolean> => {
  try {
    const customerInfo = await getCustomerInfo();
    return (
      typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined"
    );
  } catch (error) {
    console.error("[Purchases] Failed to check entitlement:", error);
    return false;
  }
};

/**
 * Check if customer info has active premium entitlement (sync helper)
 */
export const hasActiveEntitlement = (customerInfo: CustomerInfo): boolean => {
  return (
    typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined"
  );
};

/**
 * Add listener for customer info updates
 */
export const addCustomerInfoListener = (
  listener: (customerInfo: CustomerInfo) => void,
): (() => void) => {
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => {
    // RevenueCat SDK handles cleanup internally
  };
};
