import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/services/api";

// Query keys
export const statsKeys = {
  all: ["stats"] as const,
  dashboard: () => [...statsKeys.all, "dashboard"] as const,
};

// Get dashboard stats
export const useDashboardStats = () => {
  return useQuery({
    queryKey: statsKeys.dashboard(),
    queryFn: statsApi.getDashboard,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

