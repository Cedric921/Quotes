import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_CONFIG } from "../../constants/config";
import { useAppSelector } from "../../store/hooks";

export interface UserActivity {
  id: string;
  userId: string;
  date: string; // "YYYY-MM-DD"
  openCount: number;
  lastOpenedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityStats {
  year: number;
  month: number;
  totalDays: number;
  activeDays: number;
  inactiveDays: number;
  totalOpens: number;
  activities: Array<{
    date: string;
    openCount: number;
  }>;
}

const activityKeys = {
  all: ["userActivity"] as const,
  list: (startDate?: string, endDate?: string) =>
    [...activityKeys.all, "list", { startDate, endDate }] as const,
  stats: (year: number, month: number) =>
    [...activityKeys.all, "stats", { year, month }] as const,
};

export const useUserActivity = (startDate?: string, endDate?: string) => {
  const token = useAppSelector((state) => state.auth.token);

  return useQuery({
    queryKey: activityKeys.list(startDate, endDate),
    queryFn: async (): Promise<UserActivity[]> => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(
        `${API_CONFIG.getBaseUrl()}/users/me/activity?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user activity");
      }

      return response.json();
    },
    enabled: !!token,
  });
};

export const useActivityStats = (year: number, month: number) => {
  const token = useAppSelector((state) => state.auth.token);

  return useQuery({
    queryKey: activityKeys.stats(year, month),
    queryFn: async (): Promise<ActivityStats> => {
      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString(),
      });

      const response = await fetch(
        `${API_CONFIG.getBaseUrl()}/users/me/activity/stats?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch activity stats");
      }

      return response.json();
    },
    enabled: !!token,
  });
};

export const useTrackActivity = () => {
  const token = useAppSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (date: string): Promise<UserActivity> => {
      const response = await fetch(
        `${API_CONFIG.getBaseUrl()}/users/me/activity`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ date }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to track activity");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all activity queries to refetch
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
    },
  });
};

