import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, User } from "@/services/api";

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters?: object) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  subscriptionHistory: (id: string) =>
    [...userKeys.detail(id), "subscriptions"] as const,
  activeSubscription: (id: string) =>
    [...userKeys.detail(id), "activeSubscription"] as const,
  payments: (id: string) => [...userKeys.detail(id), "payments"] as const,
};

// Get all users
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: usersApi.getAll,
  });
};

// Get single user
export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
};

// Get user subscription history
export const useUserSubscriptionHistory = (userId: string) => {
  return useQuery({
    queryKey: userKeys.subscriptionHistory(userId),
    queryFn: () => usersApi.getSubscriptionHistory(userId),
    enabled: !!userId,
  });
};

// Get user active subscription
export const useUserActiveSubscription = (userId: string) => {
  return useQuery({
    queryKey: userKeys.activeSubscription(userId),
    queryFn: () => usersApi.getActiveSubscription(userId),
    enabled: !!userId,
  });
};

// Get user payments
export const useUserPayments = (userId: string) => {
  return useQuery({
    queryKey: userKeys.payments(userId),
    queryFn: () => usersApi.getPayments(userId),
    enabled: !!userId,
  });
};

// Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      usersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// Verify admin password
export const useVerifyPassword = () => {
  return useMutation({
    mutationFn: (password: string) => usersApi.verifyPassword(password),
  });
};
