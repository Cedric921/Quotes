import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

/**
 * Present the default RevenueCat paywall configured in the dashboard
 * Returns true if the user made a purchase or restored one
 */
export const presentPaywall = async (): Promise<boolean> => {
  try {
    const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();

    switch (paywallResult) {
      case PAYWALL_RESULT.NOT_PRESENTED:
      case PAYWALL_RESULT.ERROR:
      case PAYWALL_RESULT.CANCELLED:
        return false;
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        return true;
      default:
        return false;
    }
  } catch (error) {
    console.error("[Paywall] Failed to present paywall:", error);
    return false;
  }
};

/**
 * Present paywall only if the user doesn't have the required entitlement
 */
export const presentPaywallIfNeeded = async (
  entitlementId: string,
): Promise<boolean> => {
  try {
    const paywallResult: PAYWALL_RESULT =
      await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: entitlementId,
      });

    switch (paywallResult) {
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        return true;
      default:
        return false;
    }
  } catch (error) {
    console.error("[Paywall] Failed to present paywall if needed:", error);
    return false;
  }
};

