import { useMutation } from "@tanstack/react-query";
import { API_CONFIG } from "../../constants/config";
import { useAppSelector } from "../../store/hooks";
import { Platform } from "react-native";

interface RegisterPushTokenDto {
  token: string;
  deviceId?: string;
  platform?: "ios" | "android";
}

export const useRegisterPushToken = () => {
  const token = useAppSelector((state) => state.auth.token);

  return useMutation({
    mutationFn: async (pushToken: string): Promise<void> => {
      const response = await fetch(
        `${API_CONFIG.getBaseUrl()}/notifications/push-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            token: pushToken,
            platform: Platform.OS,
          } as RegisterPushTokenDto),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to register push token");
      }
    },
  });
};

export const useUnregisterPushToken = () => {
  const token = useAppSelector((state) => state.auth.token);

  return useMutation({
    mutationFn: async (pushToken: string): Promise<void> => {
      const response = await fetch(
        `${API_CONFIG.getBaseUrl()}/notifications/push-token/${encodeURIComponent(pushToken)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to unregister push token");
      }
    },
  });
};

export const useUnregisterAllPushTokens = () => {
  const token = useAppSelector((state) => state.auth.token);

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await fetch(
        `${API_CONFIG.getBaseUrl()}/notifications/push-tokens`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to unregister all push tokens");
      }
    },
  });
};

export const useSendTestNotification = () => {
  const token = useAppSelector((state) => state.auth.token);

  return useMutation({
    mutationFn: async (): Promise<{ sent: number }> => {
      const response = await fetch(
        `${API_CONFIG.getBaseUrl()}/notifications/test`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send test notification");
      }

      return response.json();
    },
  });
};

