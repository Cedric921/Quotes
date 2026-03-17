import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  subscriptionsApi,
  paymentsApi,
  SubscriptionPlan,
} from "@/services/api";

// Query keys
export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  plans: () => [...subscriptionKeys.all, "plans"] as const,
  payments: (page?: number, limit?: number) =>
    [...subscriptionKeys.all, "payments", { page, limit }] as const,
  subscriptions: () => [...subscriptionKeys.all, "list"] as const,
};

// Get all subscription plans
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: subscriptionsApi.getPlans,
  });
};

// Create subscription plan
export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<SubscriptionPlan>) =>
      subscriptionsApi.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.plans() });
    },
  });
};

// Update subscription plan
export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<SubscriptionPlan>;
    }) => subscriptionsApi.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.plans() });
    },
  });
};

// Delete subscription plan
export const useDeleteSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionsApi.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.plans() });
    },
  });
};

// Get all subscriptions
export const useSubscriptions = () => {
  return useQuery({
    queryKey: subscriptionKeys.subscriptions(),
    queryFn: subscriptionsApi.getAll,
    select: (data) => data.subscriptions,
  });
};

// Get all payments
export const usePayments = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: subscriptionKeys.payments(page, limit),
    queryFn: () => paymentsApi.getAll(page, limit),
  });
};
