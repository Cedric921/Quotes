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
  isSubscribed?: boolean;
  subscriptionId?: string;
  subscriptionStartDate?: string | null;
  subscriptionEndDate?: string | null;
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
  currency?: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  userId: string;
  user?: User;
  subscriptionId?: string;
  subscription?: {
    plan?: { name: string; type: string };
  };
  planId?: string;
  plan?: SubscriptionPlan;
  stripePaymentIntentId?: string;
  paidAt?: string;
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

export interface UserSubscription {
  id: string;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "TRIAL" | "PAST_DUE";
  startDate: string;
  endDate: string;
  plan?: {
    name: string;
    type: string;
    price: number;
  };
}

export interface UserPayment {
  id: string;
  amount: number;
  createdAt: string;
  paidAt?: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  subscription?: {
    plan?: { name: string };
  };
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
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
  getSubscriptionHistory: async (
    userId: string,
  ): Promise<UserSubscription[]> => {
    const response = await apiClient.get<UserSubscription[]>(
      `/subscriptions/users/${userId}/subscription/history`,
    );
    return response.data;
  },
  getActiveSubscription: async (
    userId: string,
  ): Promise<UserSubscription | null> => {
    try {
      const response = await apiClient.get<UserSubscription>(
        `/subscriptions/users/${userId}/subscription`,
      );
      return response.data;
    } catch {
      return null;
    }
  },
  getPayments: async (
    userId: string,
    environment?: EnvironmentFilter,
  ): Promise<UserPayment[]> => {
    const response = await apiClient.get<UserPayment[]>(
      `/subscriptions/users/${userId}/payments`,
      { params: environment ? { environment } : undefined },
    );
    return response.data;
  },
  verifyPassword: async (password: string): Promise<void> => {
    await apiClient.post("/auth/verify-password", { password });
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
    const response = await apiClient.patch<Topic>(`/topics/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/topics/${id}`);
  },
};

export interface QuoteImportItem {
  text: string;
  author?: string;
}

export interface BulkImportResult {
  message: string;
  count: number;
  quotes: Quote[];
}

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
    const response = await apiClient.patch<Quote>(`/quotes/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/quotes/${id}`);
  },
  bulkImport: async (
    topicId: string,
    quotes: QuoteImportItem[],
  ): Promise<BulkImportResult> => {
    const response = await apiClient.post<BulkImportResult>(
      "/quotes/bulk-import",
      { topicId, quotes },
    );
    return response.data;
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
    const response = await apiClient.post<Theme>(`/themes/${id}/toggle-active`);
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
    const response = await apiClient.post<Font>(`/fonts/${id}/toggle-active`);
    return response.data;
  },
};

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  startDate: string;
  endDate: string;
  amountPaid: number;
  stripePaymentIntentId?: string;
  createdAt: string;
  user?: { email: string };
  plan?: { name: string };
}

export interface PaginatedPayments {
  payments: Payment[];
  total: number;
}

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
  getAll: async (
    environment?: EnvironmentFilter,
  ): Promise<{ subscriptions: Subscription[] }> => {
    const response = await apiClient.get<{ subscriptions: Subscription[] }>(
      "/subscriptions/all",
      { params: environment ? { environment } : undefined },
    );
    return response.data;
  },
};

export const paymentsApi = {
  getAll: async (
    page: number = 1,
    limit: number = 20,
    environment?: EnvironmentFilter,
  ): Promise<PaginatedPayments> => {
    const response = await apiClient.get<PaginatedPayments>(
      "/subscriptions/payments",
      {
        params: {
          page,
          limit,
          ...(environment ? { environment } : {}),
        },
      },
    );
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

export interface DashboardStats {
  users: number;
  topics: number;
  quotes: number;
}

export interface SubscriptionStats {
  totalRevenue: number;
  monthlyRevenue: number;
  premiumUsers: number;
  freeUsers: number;
  totalUsers: number;
  premiumPercentage: number;
  revenueGrowth: number;
  recentTransactions: Array<{
    id: string;
    userName: string;
    userEmail: string;
    planName: string;
    amount: number;
    date: string;
    status: string;
  }>;
}

export interface ServiceStatus {
  status: "connected" | "disconnected" | "error" | "not_configured";
  message?: string;
  latency?: number;
}

export interface StripeStatus extends ServiceStatus {
  mode?: "test" | "live";
  webhookConfigured?: boolean;
  apiKeyConfigured?: boolean;
}

export interface RevenueCatStatus extends ServiceStatus {
  webhookConfigured?: boolean;
  apiKeyConfigured?: boolean;
  iosApiKeyConfigured?: boolean;
  androidApiKeyConfigured?: boolean;
}

export interface DatabaseStatus extends ServiceStatus {
  type?: "postgres" | "sqlite";
  provider?: "supabase" | "direct" | "local";
}

export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services: {
    database: DatabaseStatus;
    stripe: StripeStatus;
    revenuecat?: RevenueCatStatus;
    cloudinary: ServiceStatus;
  };
}

export type EnvironmentFilter = "PRODUCTION" | "SANDBOX" | undefined;

export const statsApi = {
  getDashboard: async (): Promise<DashboardStats> => {
    const [usersRes, topicsRes, quotesRes] = await Promise.all([
      apiClient.get("/users"),
      apiClient.get("/topics"),
      apiClient.get("/quotes"),
    ]);
    return {
      users: usersRes.data.length,
      topics: topicsRes.data.length,
      quotes: quotesRes.data.length,
    };
  },
  getSubscriptionStats: async (
    environment?: EnvironmentFilter,
  ): Promise<SubscriptionStats> => {
    const response = await apiClient.get<SubscriptionStats>(
      "/subscriptions/stats",
      { params: environment ? { environment } : undefined },
    );
    return response.data;
  },
  getHealthStatus: async (): Promise<HealthCheckResponse> => {
    const response = await apiClient.get<HealthCheckResponse>("/health");
    return response.data;
  },
};
