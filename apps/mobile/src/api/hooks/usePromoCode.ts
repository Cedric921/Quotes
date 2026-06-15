import { useMutation } from "@tanstack/react-query";
import apiClient from "../../services/api";

interface ApplyPromoCodeResponse {
  success: boolean;
  message: string;
  durationDays: number;
}

export const useApplyPromoCode = () => {
  return useMutation({
    mutationFn: async (code: string) => {
      const response = await apiClient.post<ApplyPromoCodeResponse>(
        "/subscriptions/apply-promo-code",
        { code }
      );
      return response.data;
    },
  });
};
