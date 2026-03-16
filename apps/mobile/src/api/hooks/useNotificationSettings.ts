import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_CONFIG } from "../../constants/config";
import { useAppSelector } from "../../store/hooks";
import { handleTokenExpired } from "../../services/authService";

export interface DailyNotificationTracker {
  date: string; // "YYYY-MM-DD"
  count: number;
  times: string[]; // Times when notifications were sent today
}

export interface NotificationSettings {
  id: string;
  userId: string;
  enabled: boolean;
  startTime: string; // "HH:mm" format (e.g., "09:00")
  endTime: string; // "HH:mm" format (e.g., "18:00")
  maxNotificationsPerDay: number; // 1-10
  activeDays: string; // JSON string of number[] (0 = Sunday, ..., 6 = Saturday)
  timezone: string;
  dailyNotificationTracker: string; // JSON string of DailyNotificationTracker
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationSettingsDto {
  enabled?: boolean;
  startTime?: string;
  endTime?: string;
  maxNotificationsPerDay?: number;
  activeDays?: number[];
  timezone?: string;
}

const notificationKeys = {
  all: ["notificationSettings"] as const,
  settings: () => [...notificationKeys.all, "settings"] as const,
};

export const useNotificationSettings = () => {
  const token = useAppSelector((state) => state.auth.token);

  return useQuery({
    queryKey: notificationKeys.settings(),
    queryFn: async (): Promise<NotificationSettings> => {
      console.log("Fetching notification settings...");
      const response = await fetch(
        `${API_CONFIG.getBaseUrl()}/users/me/notification-settings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Failed to fetch notification settings:",
          response.status,
          errorText,
        );

        // Handle 401 Unauthorized - Token expired
        if (response.status === 401) {
          await handleTokenExpired();
        }

        throw new Error(
          `Failed to fetch notification settings: ${response.status}`,
        );
      }

      const data = await response.json();
      console.log(
        "Notification settings fetched:",
        JSON.stringify(data, null, 2),
      );
      return data;
    },
    enabled: !!token,
    staleTime: 0, // Always consider data stale
    refetchOnMount: true, // Refetch when component mounts
  });
};

export const useUpdateNotificationSettings = () => {
  const token = useAppSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: UpdateNotificationSettingsDto,
    ): Promise<NotificationSettings> => {
      console.log(
        "Updating notification settings:",
        JSON.stringify(data, null, 2),
      );
      const response = await fetch(
        `${API_CONFIG.getBaseUrl()}/users/me/notification-settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Failed to update notification settings:",
          response.status,
          errorText,
        );
        throw new Error(
          `Failed to update notification settings: ${response.status}`,
        );
      }

      const result = await response.json();
      console.log(
        "Notification settings updated:",
        JSON.stringify(result, null, 2),
      );
      return result;
    },
    onSuccess: (data) => {
      console.log("Mutation success, updating cache");
      queryClient.setQueryData(notificationKeys.settings(), data);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });
};

export const useResetNotificationSettings = () => {
  const token = useAppSelector((state) => state.auth.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<NotificationSettings> => {
      const response = await fetch(
        `${API_CONFIG.getBaseUrl()}/users/me/notification-settings/reset`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to reset notification settings");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(notificationKeys.settings(), data);
    },
  });
};
