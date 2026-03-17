import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Create axios instance with auth interceptor
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  isPremium?: boolean;
  subscriptionId?: string;
  createdAt: string;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  title?: string;
  icon?: string;
  color?: string;
  isPremium?: boolean;
  quotesCount?: number;
}

export interface Quote {
  id: string;
  text: string;
  author?: string;
  topicId: string;
  topic?: Topic;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  order: number;
  isActive: boolean;
  isPremium?: boolean;
  fontName?: string;
  fontFamily?: string;
}

export interface Font {
  id: string;
  name: string;
  fontFamily: string;
  description?: string;
  previewText?: string;
  isActive: boolean;
  isPremium: boolean;
  order: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMonths: number;
  stripePriceId: string;
  isActive: boolean;
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
  userId: string;
  user?: User;
  planId?: string;
  plan?: SubscriptionPlan;
  createdAt: string;
}

export interface SocialNetwork {
  id: string;
  name: string;
  url: string;
  icon: string;
  color?: string;
  isActive: boolean;
  order: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "UNREAD" | "READ";
  userId?: string;
  createdAt: string;
}

// API Functions
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>("/users");
    return response.data;
  },
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },
  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};

export const topicsApi = {
  getAll: async (): Promise<Topic[]> => {
    const response = await apiClient.get<Topic[]>("/topics");
    return response.data;
  },
  create: async (data: Partial<Topic>): Promise<Topic> => {
    const response = await apiClient.post<Topic>("/topics", data);
    return response.data;
  },
  update: async (id: string, data: Partial<Topic>): Promise<Topic> => {
    const response = await apiClient.put<Topic>(`/topics/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/topics/${id}`);
  },
};

export const quotesApi = {
  getAll: async (): Promise<Quote[]> => {
    const response = await apiClient.get<Quote[]>("/quotes");
    return response.data;
  },
  create: async (data: Partial<Quote>): Promise<Quote> => {
    const response = await apiClient.post<Quote>("/quotes", data);
    return response.data;
  },
  update: async (id: string, data: Partial<Quote>): Promise<Quote> => {
    const response = await apiClient.put<Quote>(`/quotes/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/quotes/${id}`);
  },
};

export const themesApi = {
  getAll: async (): Promise<Theme[]> => {
    const response = await apiClient.get<Theme[]>("/themes");
    return response.data;
  },
  create: async (formData: FormData): Promise<Theme> => {
    const response = await apiClient.post<Theme>("/themes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  update: async (id: string, formData: FormData): Promise<Theme> => {
    const response = await apiClient.put<Theme>(`/themes/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/themes/${id}`);
  },
  toggleActive: async (id: string): Promise<Theme> => {
    const response = await apiClient.put<Theme>(`/themes/${id}/toggle-active`);
    return response.data;
  },
};

export const fontsApi = {
  getAll: async (): Promise<Font[]> => {
    const response = await apiClient.get<Font[]>("/fonts");
    return response.data;
  },
  getActive: async (): Promise<Font[]> => {
    const response = await apiClient.get<Font[]>("/fonts/active");
    return response.data;
  },
  create: async (data: Partial<Font>): Promise<Font> => {
    const response = await apiClient.post<Font>("/fonts", data);
    return response.data;
  },
  update: async (id: string, data: Partial<Font>): Promise<Font> => {
    const response = await apiClient.put<Font>(`/fonts/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/fonts/${id}`);
  },
  toggleActive: async (id: string): Promise<Font> => {
    const response = await apiClient.put<Font>(`/fonts/${id}/toggle-active`);
    return response.data;
  },
};

export const subscriptionsApi = {
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await apiClient.get<SubscriptionPlan[]>(
      "/subscriptions/plans",
    );
    return response.data;
  },
  createPlan: async (
    data: Partial<SubscriptionPlan>,
  ): Promise<SubscriptionPlan> => {
    const response = await apiClient.post<SubscriptionPlan>(
      "/subscriptions/plans",
      data,
    );
    return response.data;
  },
  updatePlan: async (
    id: string,
    data: Partial<SubscriptionPlan>,
  ): Promise<SubscriptionPlan> => {
    const response = await apiClient.put<SubscriptionPlan>(
      `/subscriptions/plans/${id}`,
      data,
    );
    return response.data;
  },
  deletePlan: async (id: string): Promise<void> => {
    await apiClient.delete(`/subscriptions/plans/${id}`);
  },
};

export const paymentsApi = {
  getAll: async (): Promise<Payment[]> => {
    const response = await apiClient.get<Payment[]>("/subscriptions/payments");
    return response.data;
  },
};

export const socialApi = {
  getAll: async (): Promise<SocialNetwork[]> => {
    const response = await apiClient.get<SocialNetwork[]>("/social");
    return response.data;
  },
  create: async (data: Partial<SocialNetwork>): Promise<SocialNetwork> => {
    const response = await apiClient.post<SocialNetwork>("/social", data);
    return response.data;
  },
  update: async (
    id: string,
    data: Partial<SocialNetwork>,
  ): Promise<SocialNetwork> => {
    const response = await apiClient.put<SocialNetwork>(`/social/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/social/${id}`);
  },
  toggleActive: async (id: string): Promise<SocialNetwork> => {
    const response = await apiClient.put<SocialNetwork>(
      `/social/${id}/toggle-active`,
    );
    return response.data;
  },
};

export const contactApi = {
  getAll: async (): Promise<ContactMessage[]> => {
    const response = await apiClient.get<ContactMessage[]>("/contact");
    return response.data;
  },
  getById: async (id: string): Promise<ContactMessage> => {
    const response = await apiClient.get<ContactMessage>(`/contact/${id}`);
    return response.data;
  },
  markAsUnread: async (id: string): Promise<ContactMessage> => {
    const response = await apiClient.put<ContactMessage>(
      `/contact/${id}/mark-unread`,
    );
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/contact/${id}`);
  },
};

export const statsApi = {
  getDashboard: async () => {
    const response = await apiClient.get("/health/stats");
    return response.data;
  },
};
