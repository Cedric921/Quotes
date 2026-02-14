import Constants from "expo-constants";

/**
 * Get environment variable with fallback
 * Priority: expoConfig.extra > process.env > fallback
 */
const getEnvVar = (key: string, fallback: string | number): string => {
  // Try expoConfig.extra first (from app.config.js which reads .env)
  const expoValue = Constants.expoConfig?.extra?.[key];
  if (expoValue !== undefined) {
    return String(expoValue);
  }

  // Fallback to process.env (for web)
  const processValue = process.env[key];
  if (processValue !== undefined) {
    return String(processValue);
  }

  // Use default fallback
  return String(fallback);
};

// Read API URL from environment
const API_URL = getEnvVar("API_URL", "http://localhost:3001");

// Log configuration on app start (only once)
console.log("===========================================");
console.log("📱 FOCUS APP CONFIGURATION");
console.log("===========================================");
console.log(`🌐 API URL: ${API_URL}`);
console.log("===========================================");

/**
 * API Configuration
 */
export const API_CONFIG = {
  // Base URL for API (from .env file via app.config.js)
  BASE_URL: API_URL,

  // Request timeout in milliseconds
  TIMEOUT: Number.parseInt(getEnvVar("API_TIMEOUT", "30000"), 10),

  // Get the base URL (for backward compatibility)
  getBaseUrl: (): string => {
    return API_CONFIG.BASE_URL;
  },
};

/**
 * App Configuration
 */
export const APP_CONFIG = {
  // Number of quotes to load per page
  QUOTES_PER_PAGE: Number.parseInt(getEnvVar("QUOTES_PER_PAGE", "10"), 10),

  // Pagination threshold for infinite scroll
  PAGINATION_THRESHOLD: Number.parseFloat(
    getEnvVar("PAGINATION_THRESHOLD", "0.5"),
  ),
};
