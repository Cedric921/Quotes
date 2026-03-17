import { useQuery } from "@tanstack/react-query";
import { statsApi, HealthCheckResponse } from "@/services/api";

// Query keys
export const statsKeys = {
  all: ["stats"] as const,
  dashboard: () => [...statsKeys.all, "dashboard"] as const,
  subscriptions: () => [...statsKeys.all, "subscriptions"] as const,
  health: () => [...statsKeys.all, "health"] as const,
};

// Get dashboard stats (users, topics, quotes counts)
export const useDashboardStats = () => {
  return useQuery({
    queryKey: statsKeys.dashboard(),
    queryFn: statsApi.getDashboard,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get subscription stats (revenue, premium users, etc.)
export const useSubscriptionStats = () => {
  return useQuery({
    queryKey: statsKeys.subscriptions(),
    queryFn: statsApi.getSubscriptionStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get health status
export const useHealthStatus = () => {
  return useQuery({
    queryKey: statsKeys.health(),
    queryFn: statsApi.getHealthStatus,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
    // Provide fallback data when health check fails
    placeholderData: {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: "error",
          message: "Unable to check",
          type: "sqlite",
          provider: "local",
        },
        stripe: {
          status: "error",
          message: "Unable to check",
          apiKeyConfigured: false,
          webhookConfigured: false,
        },
        cloudinary: { status: "error", message: "Unable to check" },
      },
    } as HealthCheckResponse,
  });
};
