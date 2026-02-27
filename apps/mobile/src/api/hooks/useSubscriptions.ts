import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/api";
import {
  SubscriptionPlan,
  Subscription,
  AppConfig,
} from "../../store/slices/subscriptionSlice";

// Payment interface
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "SUCCEEDED" | "PENDING" | "FAILED" | "REFUNDED";
  stripePaymentIntentId?: string;
  createdAt: string;
  subscription?: Subscription;
}

// Query keys
export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  plans: () => [...subscriptionKeys.all, "plans"] as const,
  config: () => [...subscriptionKeys.all, "config"] as const,
  current: () => [...subscriptionKeys.all, "current"] as const,
  history: () => [...subscriptionKeys.all, "history"] as const,
  payments: () => [...subscriptionKeys.all, "payments"] as const,
};

// Fetch subscription plans
export const useSubscriptionPlans = (activeOnly: boolean = true) => {
  return useQuery({
    queryKey: [...subscriptionKeys.plans(), { activeOnly }],
    queryFn: async () => {
      const response = await apiClient.get<SubscriptionPlan[]>(
        `/subscriptions/plans?activeOnly=${activeOnly}`,
      );
      return response.data;
    },
  });
};

// Fetch app config (prices, freemium duration, etc.)
export const useSubscriptionConfig = () => {
  return useQuery({
    queryKey: subscriptionKeys.config(),
    queryFn: async () => {
      const response = await apiClient.get<AppConfig>("/subscriptions/config");
      return response.data;
    },
  });
};

// Fetch current user subscription
export const useCurrentSubscription = (enabled: boolean = true) => {
  return useQuery({
    queryKey: subscriptionKeys.current(),
    queryFn: async () => {
      const response = await apiClient.get<Subscription>(
        "/subscriptions/my-subscription",
      );
      return response.data;
    },
    enabled,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (no subscription)
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
};

// Fetch subscription history
export const useSubscriptionHistory = (enabled: boolean = true) => {
  return useQuery({
    queryKey: subscriptionKeys.history(),
    queryFn: async () => {
      const response = await apiClient.get<Subscription[]>(
        "/subscriptions/my-subscription/history",
      );
      return response.data;
    },
    enabled,
  });
};

// Fetch user payments
export const useUserPayments = (enabled: boolean = true) => {
  return useQuery({
    queryKey: subscriptionKeys.payments(),
    queryFn: async () => {
      const response = await apiClient.get<Payment[]>(
        "/subscriptions/my-payments",
      );
      return response.data;
    },
    enabled,
  });
};

// Start free trial mutation
export const useStartFreeTrial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<Subscription>(
        "/subscriptions/start-trial",
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(subscriptionKeys.current(), data);
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
};

// Create checkout session mutation
export const useCreateCheckout = () => {
  return useMutation({
    mutationFn: async (planId: string) => {
      console.log({ planId });
      const response = await apiClient.post<{ url: string; sessionId: string }>(
        "/subscriptions/checkout",
        { planId },
      );
      return response.data;
    },
  });
};

// Cancel subscription mutation
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<Subscription>(
        "/subscriptions/cancel",
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
};

// Combined hook for subscription screen data
export const useSubscriptionData = (isAuthenticated: boolean = false) => {
  const plansQuery = useSubscriptionPlans();
  const configQuery = useSubscriptionConfig();
  const currentQuery = useCurrentSubscription(isAuthenticated);

  return {
    plans: plansQuery.data ?? [],
    config: configQuery.data ?? null,
    currentSubscription: currentQuery.data ?? null,
    isLoading: plansQuery.isLoading || configQuery.isLoading,
    isError: plansQuery.isError || configQuery.isError,
    refetch: () => {
      plansQuery.refetch();
      configQuery.refetch();
      if (isAuthenticated) currentQuery.refetch();
    },
  };
};
