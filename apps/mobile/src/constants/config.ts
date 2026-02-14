import Constants from "expo-constants";

/**
 * Get environment variable with fallback
 */
const getEnvVar = (key: string, fallback: string | number): string => {
  const value = Constants.expoConfig?.extra?.[key] || process.env[key];
  return value === undefined ? String(fallback) : String(value);
};

/**
 * API Configuration
 */
export const API_CONFIG = {
  // Base URL for API (from environment variable)
  BASE_URL: getEnvVar("API_URL", "http://192.168.1.66:3001"),

  // Request timeout in milliseconds (from environment variable)
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
  // Number of quotes to load per page (from environment variable)
  QUOTES_PER_PAGE: Number.parseInt(getEnvVar("QUOTES_PER_PAGE", "10"), 10),

  // Pagination threshold for infinite scroll (from environment variable)
  PAGINATION_THRESHOLD: Number.parseFloat(
    getEnvVar("PAGINATION_THRESHOLD", "0.5"),
  ),
};
