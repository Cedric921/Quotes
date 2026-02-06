import axios from 'axios';
import { Platform } from 'react-native';
import { Quote } from '../types';

// For development:
// - Web: use localhost
// - iOS Simulator: use localhost
// - Android Emulator: use 10.0.2.2
// - Physical device: use your computer's IP address
const getApiUrl = () => {
  // For web platform (browser)
  if (Platform.OS === 'web') {
    return 'http://localhost:3001';
  }

  // For physical devices, use the computer's local IP
  // This IP should match your computer's IP on the local network
  const LOCAL_IP = '192.168.1.66';

  // Check if running on emulator or physical device
  // Expo Go on physical device needs the local IP
  return `http://${LOCAL_IP}:3001`;
};

const API_URL = getApiUrl();

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const quotesApi = {
  getQuotes: async (page: number = 1, limit: number = 10): Promise<Quote[]> => {
    const response = await apiClient.get<Quote[]>('/quotes', {
      params: { page, limit },
    });
    return response.data;
  },

  likeQuote: async (quoteId: number): Promise<void> => {
    await apiClient.post(`/quotes/${quoteId}/like`);
  },

  unlikeQuote: async (quoteId: number): Promise<void> => {
    await apiClient.delete(`/quotes/${quoteId}/like`);
  },
};

export default apiClient;
