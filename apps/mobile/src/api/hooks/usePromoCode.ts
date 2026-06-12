import { useMutation } from "@tanstack/react-query";
import { API_CONFIG } from "../config";

interface ApplyPromoCodeResponse {
  success: boolean;
  message: string;
  durationDays: number;
}

export const useApplyPromoCode = () => {
  return useMutation({
    mutationFn: async ({ code, token }: { code: string; token: string }) => {
      const response = await fetch(
        `${API_CONFIG.getBaseUrl()}/subscriptions/apply-promo-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to apply promo code");
      }

      return data as ApplyPromoCodeResponse;
    },
  });
};
