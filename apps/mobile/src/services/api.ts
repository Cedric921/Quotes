import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Quote, Topic } from "../types";
import { API_CONFIG } from "../constants/config";
import { handleTokenExpired } from "./authService";

const apiClient = axios.create({
  baseURL: API_CONFIG.getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor for adding auth token and logging
apiClient.interceptors.request.use(
  async (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);

    // Add auth token if available
    const token = await AsyncStorage.getItem("@focus_auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[API Response] ${response.config.url} - Status: ${response.status}`,
    );
    return response;
  },
  async (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      console.error(
        `[API Error] ${error.response.status} - ${error.response.statusText}`,
      );

      // Handle 401 Unauthorized - Token expired
      if (error.response.status === 401) {
        await handleTokenExpired();
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("[API Error] No response received from server");
    } else {
      // Error in request setup
      console.error("[API Error]", error.message);
    }
    return Promise.reject(error);
  },
);

/**
 * Helper function to get userId from stored JWT token
 */
const getUserIdFromToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem("@focus_auth_token");
    if (!token) return null;

    // Decode JWT payload (simple decode, not verification)
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.userId || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const quotesApi = {
  /**
   * Get paginated quotes
   * @param page - Page number (default: 1)
   * @param limit - Number of quotes per page (default: 10)
   * @param topicId - Optional topic filter
   */
  getQuotes: async (
    page: number = 1,
    limit: number = 10,
    topicId?: string,
  ): Promise<Quote[]> => {
    const userId = await getUserIdFromToken();
    const response = await apiClient.get<Quote[]>("/quotes", {
      params: {
        page,
        limit,
        ...(topicId && { topicId }),
        ...(userId && { userId }),
      },
    });
    return response.data;
  },

  /**
   * Get all quotes for a specific topic
   * @param topicId - Topic ID
   */
  getQuotesByTopic: async (topicId: string): Promise<Quote[]> => {
    const userId = await getUserIdFromToken();
    const response = await apiClient.get<Quote[]>("/quotes", {
      params: { topicId, ...(userId && { userId }) },
    });
    return response.data;
  },

  /**
   * Get a single quote by ID
   * @param quoteId - Quote ID
   */
  getQuoteById: async (quoteId: string): Promise<Quote> => {
    const userId = await getUserIdFromToken();
    const response = await apiClient.get<Quote>(`/quotes/${quoteId}`, {
      params: { ...(userId && { userId }) },
    });
    return response.data;
  },

  /**
   * Like a quote
   * @param quoteId - Quote ID
   */
  likeQuote: async (quoteId: string): Promise<void> => {
    await apiClient.post(`/quotes/${quoteId}/like`);
  },

  /**
   * Unlike a quote
   * @param quoteId - Quote ID
   */
  unlikeQuote: async (quoteId: string): Promise<void> => {
    await apiClient.delete(`/quotes/${quoteId}/like`);
  },
};

export const topicsApi = {
  /**
   * Get all topics
   */
  getTopics: async (): Promise<Topic[]> => {
    const response = await apiClient.get<Topic[]>("/topics");
    return response.data;
  },

  /**
   * Get a single topic by ID
   * @param topicId - Topic ID
   */
  getTopicById: async (topicId: string): Promise<Topic> => {
    const response = await apiClient.get<Topic>(`/topics/${topicId}`);
    return response.data;
  },
};

export interface BackgroundTheme {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  order: number;
  isActive: boolean;
  // Font fields - embedded in theme
  fontName?: string;
  fontFamily?: string;
  isPremium?: boolean;
}

export const themesApi = {
  /**
   * Get all active themes (max 10)
   */
  getActiveThemes: async (): Promise<BackgroundTheme[]> => {
    const response = await apiClient.get<BackgroundTheme[]>("/themes/active");
    return response.data;
  },
};

// Font types
export interface FontItem {
  id: string;
  name: string;
  fontFamily: string;
  description?: string;
  previewText?: string;
  isActive: boolean;
  isPremium: boolean;
  order: number;
}

export const fontsApi = {
  /**
   * Get all active fonts (max 10)
   */
  getActiveFonts: async (): Promise<FontItem[]> => {
    const response = await apiClient.get<FontItem[]>("/fonts/active");
    return response.data;
  },
};

// Social Network types
export interface SocialNetwork {
  id: string;
  name: string;
  url: string;
  icon: string;
  color?: string;
}

export const socialApi = {
  /**
   * Get all active social networks
   */
  getActiveSocials: async (): Promise<SocialNetwork[]> => {
    const response = await apiClient.get<SocialNetwork[]>("/social/active");
    return response.data;
  },
};

// Contact types
export interface ContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contactApi = {
  /**
   * Send a contact message
   */
  sendMessage: async (data: ContactMessageInput): Promise<void> => {
    await apiClient.post("/contact", data);
  },
};

export default apiClient;
