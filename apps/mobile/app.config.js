import "dotenv/config";

/**
 * Dynamic Expo Configuration
 *
 * This file reads environment variables from .env file and passes them to the app.
 * To configure the API URL:
 * 1. Edit the .env file at apps/mobile/.env
 * 2. Set API_URL to your desired value:
 *    - For local development: https://focus-sml2.onrender.com
 *    - For physical device (same network): http://YOUR_IP:3001
 *    - For production: https://api.quote.com
 *
 * The app will automatically use the value from .env
 */

export default ({ config }) => {
  // Read API_URL from environment or use default
  const apiUrl = process.env.API_URL || "https://focus-sml2.onrender.com";
  const apiTimeout = process.env.API_TIMEOUT || "30000";
  const quotesPerPage = process.env.QUOTES_PER_PAGE || "10";
  const paginationThreshold = process.env.PAGINATION_THRESHOLD || "0.5";

  console.log(`[Config] API_URL: ${apiUrl}`);

  return {
    ...config,
    name: "Focus",
    slug: "focus-quotes",
    version: "1.0.0",
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
      bundleIdentifier: "com.focus.quotes",
      entitlements: {
        "com.apple.security.application-groups": [
          "group.com.focus.quotes.widget",
        ],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.focus.quotes",
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
              label: "Focus Quote",
              minWidth: "180dp",
              minHeight: "110dp",
              description: "Affiche une citation inspirante",
              previewImage: "./assets/widget-preview.png",
              updatePeriodMillis: 1800000, // 30 minutes
            },
            {
              name: "FocusQuoteWidgetLarge",
              label: "Focus Quote (Large)",
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
          appleTeamId: process.env.APPLE_TEAM_ID || "XXXXXXXXXX",
        },
      ],
    ],
    extra: {
      API_URL: apiUrl,
      API_TIMEOUT: apiTimeout,
      QUOTES_PER_PAGE: quotesPerPage,
      PAGINATION_THRESHOLD: paginationThreshold,
      eas: {
        projectId: "17f0365b-1f51-4a37-b269-591ea43caffe",
      },
    },
    owner: "cedric921",
    runtimeVersion: {
      policy: "sdkVersion",
    },
    updates: {
      url: "https://u.expo.dev/17f0365b-1f51-4a37-b269-591ea43caffe",
    },
  };
};

