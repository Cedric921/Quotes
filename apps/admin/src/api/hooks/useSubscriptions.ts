import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  EnvironmentFilter,
  paymentsApi,
  SubscriptionPlan,
  subscriptionsApi,
} from "@/services/api";
import { useEnvironment } from "@/contexts/EnvironmentContext";

// Query keys
export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  plans: () => [...subscriptionKeys.all, "plans"] as const,
  payments: (page?: number, limit?: number, environment?: EnvironmentFilter) =>
    [
      ...subscriptionKeys.all,
      "payments",
      { page, limit, environment },
    ] as const,
  subscriptions: (environment?: EnvironmentFilter) =>
    [...subscriptionKeys.all, "list", { environment }] as const,
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

// Get all subscriptions scoped to the selected environment
export const useSubscriptions = () => {
  const { queryValue } = useEnvironment();
  return useQuery({
    queryKey: subscriptionKeys.subscriptions(queryValue),
    queryFn: () => subscriptionsApi.getAll(queryValue),
    select: (data) => data.subscriptions,
  });
};

// Get all payments scoped to the selected environment
export const usePayments = (page: number = 1, limit: number = 20) => {
  const { queryValue } = useEnvironment();
  return useQuery({
    queryKey: subscriptionKeys.payments(page, limit, queryValue),
    queryFn: () => paymentsApi.getAll(page, limit, queryValue),
  });
};
