import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { promoCodesApi, PromoCode } from "@/services/api";

// Query keys
export const promoCodeKeys = {
  all: ["promo-codes"] as const,
  lists: () => [...promoCodeKeys.all, "list"] as const,
  list: () => [...promoCodeKeys.lists()] as const,
  details: () => [...promoCodeKeys.all, "detail"] as const,
  detail: (id: string) => [...promoCodeKeys.details(), id] as const,
  users: (code: string) => [...promoCodeKeys.all, code, "users"] as const,
};

// Get all promo codes
export const usePromoCodes = () => {
  return useQuery({
    queryKey: promoCodeKeys.list(),
    queryFn: promoCodesApi.getAll,
  });
};

// Get single promo code
export const usePromoCode = (id: string) => {
  return useQuery({
    queryKey: promoCodeKeys.detail(id),
    queryFn: () => promoCodesApi.getById(id),
    enabled: !!id,
  });
};

// Get users who used a promo code
export const usePromoCodeUsers = (code: string) => {
  return useQuery({
    queryKey: promoCodeKeys.users(code),
    queryFn: () => promoCodesApi.getUsersByCode(code),
    enabled: !!code,
  });
};

// Create promo code
export const useCreatePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PromoCode>) => promoCodesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promoCodeKeys.lists() });
    },
  });
};

// Update promo code
export const useUpdatePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PromoCode> }) =>
      promoCodesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: promoCodeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: promoCodeKeys.lists() });
    },
  });
};

// Delete promo code
export const useDeletePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => promoCodesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promoCodeKeys.lists() });
    },
  });
};
