import "dotenv/config";

/**
 * Dynamic Expo Configuration
 *
 * This file reads environment variables from .env file and passes them to the app.
 * To configure the API URL:
 * 1. Edit the .env file at apps/mobile/.env
 * 2. Set API_URL to your desired value:
 *    - For local development: http://localhost:3001
 *    - For physical device (same network): http://YOUR_IP:3001
 *    - For production: https://api.quote.com
 *
 * The app will automatically use the value from .env
 */

export default ({ config }) => {
  // Read API_URL from environment or use default
  const apiUrl = process.env.API_URL || "http://localhost:3001";
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
    plugins: ["expo-localization"],
    extra: {
      API_URL: apiUrl,
      API_TIMEOUT: apiTimeout,
      QUOTES_PER_PAGE: quotesPerPage,
      PAGINATION_THRESHOLD: paginationThreshold,
    },
  };
};

