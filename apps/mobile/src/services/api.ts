import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Quote, Topic } from "../types";
import { API_CONFIG } from "../constants/config";

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
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      console.error(
        `[API Error] ${error.response.status} - ${error.response.statusText}`,
      );
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
    const response = await apiClient.get<Quote[]>("/quotes", {
      params: { page, limit, ...(topicId && { topicId }) },
    });
    return response.data;
  },

  /**
   * Get all quotes for a specific topic
   * @param topicId - Topic ID
   */
  getQuotesByTopic: async (topicId: string): Promise<Quote[]> => {
    const response = await apiClient.get<Quote[]>("/quotes", {
      params: { topicId },
    });
    return response.data;
  },

  /**
   * Get a single quote by ID
   * @param quoteId - Quote ID
   */
  getQuoteById: async (quoteId: string): Promise<Quote> => {
    const response = await apiClient.get<Quote>(`/quotes/${quoteId}`);
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

export default apiClient;
