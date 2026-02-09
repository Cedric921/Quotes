import { Platform } from "react-native";

/**
 * API Configuration
 */
export const API_CONFIG = {
  // Local IP for physical devices (update this to match your computer's IP)
  LOCAL_IP: "192.168.1.64",

  // API Port
  PORT: 3001,

  // Request timeout in milliseconds
  TIMEOUT: 10000,

  // Get the appropriate API URL based on platform
  getBaseUrl: () => {
    if (Platform.OS === "web") {
      return `http://localhost:${API_CONFIG.PORT}`;
    }
    return `http://${API_CONFIG.LOCAL_IP}:${API_CONFIG.PORT}`;
  },
};

/**
 * App Configuration
 */
export const APP_CONFIG = {
  // Number of quotes to load per page
  QUOTES_PER_PAGE: 10,

  // Pagination threshold for infinite scroll
  PAGINATION_THRESHOLD: 0.5,
};
