import "dotenv/config";

/**
 * Dynamic Expo Configuration
 *
 * All values are configurable via .env file.
 * See .env.example for all available options.
 *
 * Usage:
 * 1. Copy .env.example to .env: cp .env.example .env
 * 2. Update the values in .env
 * 3. Run the app: npm start
 */

export default ({ config }) => {
  // ===========================================
  // EAS / Expo Configuration
  // ===========================================
  const easProjectId =
    process.env.EAS_PROJECT_ID || "035730c8-2c0a-4ade-9b34-f902e800ebfa";
  const easOwner = process.env.EAS_OWNER || "focus-application";
  const appSlug = process.env.APP_SLUG || "focus-quotes-app";
  const appName = process.env.APP_NAME || "Focus";
  const appVersion = process.env.APP_VERSION || "1.0.1";

  // ===========================================
  // Platform-specific Configuration
  // ===========================================
  const iosBundleId = process.env.IOS_BUNDLE_ID || "com.mindset.focus";
  const androidPackage = process.env.ANDROID_PACKAGE || "com.mindset.focus";
  const appleTeamId = process.env.APPLE_TEAM_ID || "XXXXXXXXXX";

  // ===========================================
  // API Configuration
  // ===========================================
  const apiUrl = process.env.API_URL || "https://focus-app-1.onrender.com";
  const apiTimeout = process.env.API_TIMEOUT || "30000";

  // ===========================================
  // App Behavior Configuration
  // ===========================================
  const quotesPerPage = process.env.QUOTES_PER_PAGE || "10";
  const paginationThreshold = process.env.PAGINATION_THRESHOLD || "0.5";
  const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY || "";

  // RevenueCat Configuration
  const revenueCatApiKeyIos = process.env.REVENUECAT_API_KEY_IOS || "";
  const revenueCatApiKeyAndroid = process.env.REVENUECAT_API_KEY_ANDROID || "";

  // Log configuration (useful for debugging)
  console.log(`[Config] APP: ${appName} v${appVersion} (${appSlug})`);
  console.log(`[Config] EAS: ${easOwner}/${easProjectId}`);
  console.log(`[Config] API_URL: ${apiUrl}`);

  return {
    ...config,
    name: appName,
    slug: appSlug,
    version: appVersion,
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: iosBundleId,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: androidPackage,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-localization",
      [
        "react-native-android-widget",
        {
          widgets: [
            {
              name: "FocusQuoteWidget",
              label: `${appName} Quote`,
              minWidth: "180dp",
              minHeight: "110dp",
              description: "Affiche une citation inspirante",
              previewImage: "./assets/widget-preview.png",
              updatePeriodMillis: 1800000, // 30 minutes
            },
            {
              name: "FocusQuoteWidgetLarge",
              label: `${appName} Quote (Large)`,
              minWidth: "250dp",
              minHeight: "180dp",
              description: "Affiche une citation inspirante en grand",
              previewImage: "./assets/widget-preview-large.png",
              updatePeriodMillis: 1800000,
            },
          ],
        },
      ],
      [
        "@bacons/apple-targets",
        {
          appleTeamId: appleTeamId,
        },
      ],
    ],
    extra: {
      // API Configuration
      API_URL: apiUrl,
      API_TIMEOUT: apiTimeout,
      // App Behavior
      QUOTES_PER_PAGE: quotesPerPage,
      PAGINATION_THRESHOLD: paginationThreshold,
      // EAS
      EAS_PROJECT_ID: easProjectId,
      // Stripe (legacy)
      STRIPE_PUBLISHABLE_KEY: stripePublishableKey,
      // RevenueCat
      REVENUECAT_API_KEY_IOS: revenueCatApiKeyIos,
      REVENUECAT_API_KEY_ANDROID: revenueCatApiKeyAndroid,
      // EAS internal config
      eas: {
        projectId: easProjectId,
      },
    },
    owner: easOwner,
    runtimeVersion: {
      policy: "sdkVersion",
    },
    updates: {
      url: `https://u.expo.dev/${easProjectId}`,
    },
  };
};

