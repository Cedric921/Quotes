import { useQuery } from "@tanstack/react-query";
import {
  EnvironmentFilter,
  HealthCheckResponse,
  statsApi,
} from "@/services/api";
import { useEnvironment } from "@/contexts/EnvironmentContext";

// Query keys
export const statsKeys = {
  all: ["stats"] as const,
  dashboard: () => [...statsKeys.all, "dashboard"] as const,
  subscriptions: (environment?: EnvironmentFilter) =>
    [...statsKeys.all, "subscriptions", { environment }] as const,
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

// Get subscription stats (revenue, premium users, etc.) scoped to the
// currently selected environment (Production / Sandbox / All).
export const useSubscriptionStats = () => {
  const { queryValue } = useEnvironment();
  return useQuery({
    queryKey: statsKeys.subscriptions(queryValue),
    queryFn: () => statsApi.getSubscriptionStats(queryValue),
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
        revenuecat: {
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
