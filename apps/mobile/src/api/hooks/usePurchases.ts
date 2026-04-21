import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
} from "react-native-purchases";
import {
  getOfferings,
  getPackages,
  purchasePackage,
  restorePurchases,
  getCustomerInfo,
  isPremiumActive,
  hasActiveEntitlement,
  addCustomerInfoListener,
  loginUser,
  logoutUser,
} from "../../services/purchases";
import apiClient from "../../services/api";

// Query keys
export const purchasesKeys = {
  all: ["purchases"] as const,
  offerings: () => [...purchasesKeys.all, "offerings"] as const,
  packages: () => [...purchasesKeys.all, "packages"] as const,
  customerInfo: () => [...purchasesKeys.all, "customerInfo"] as const,
  premiumStatus: () => [...purchasesKeys.all, "premiumStatus"] as const,
};

/**
 * Hook to get current offerings from RevenueCat
 */
export const useOfferings = () => {
  return useQuery({
    queryKey: purchasesKeys.offerings(),
    queryFn: getOfferings,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to get available packages
 */
export const usePackages = () => {
  return useQuery({
    queryKey: purchasesKeys.packages(),
    queryFn: getPackages,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to get customer info with real-time updates
 */
export const useCustomerInfo = () => {
  const queryClient = useQueryClient();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  // Set up listener for real-time updates
  useEffect(() => {
    const cleanup = addCustomerInfoListener((info) => {
      setCustomerInfo(info);
      queryClient.setQueryData(purchasesKeys.customerInfo(), info);
    });

    // Initial fetch
    getCustomerInfo().then(setCustomerInfo).catch(console.error);

    return cleanup;
  }, [queryClient]);

  return {
    customerInfo,
    isLoading: customerInfo === null,
    isPremium: customerInfo ? hasActiveEntitlement(customerInfo) : false,
    refetch: async () => {
      const info = await getCustomerInfo();
      setCustomerInfo(info);
      return info;
    },
  };
};

/**
 * Hook to check premium status
 */
export const usePremiumStatus = () => {
  return useQuery({
    queryKey: purchasesKeys.premiumStatus(),
    queryFn: isPremiumActive,
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Hook to make a purchase
 */
export const usePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      const customerInfo = await purchasePackage(pkg);

      // Sync with backend
      try {
        await apiClient.post("/subscriptions/sync-revenuecat", {
          revenueCatUserId: customerInfo.originalAppUserId,
          entitlements: Object.keys(customerInfo.entitlements.active),
        });
      } catch (error) {
        console.error("[usePurchase] Failed to sync with backend:", error);
      }

      return customerInfo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchasesKeys.all });
    },
  });
};

/**
 * Hook to restore purchases
 */
export const useRestorePurchases = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const customerInfo = await restorePurchases();

      // Sync with backend
      try {
        await apiClient.post("/subscriptions/sync-revenuecat", {
          revenueCatUserId: customerInfo.originalAppUserId,
          entitlements: Object.keys(customerInfo.entitlements.active),
        });
      } catch (error) {
        console.error("[useRestorePurchases] Failed to sync:", error);
      }

      return customerInfo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchasesKeys.all });
    },
  });
};

/**
 * Hook to login/logout from RevenueCat
 */
export const useRevenueCatAuth = () => {
  const queryClient = useQueryClient();

  const login = useCallback(
    async (userId: string) => {
      const info = await loginUser(userId);
      queryClient.invalidateQueries({ queryKey: purchasesKeys.all });
      return info;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    const info = await logoutUser();
    queryClient.invalidateQueries({ queryKey: purchasesKeys.all });
    return info;
  }, [queryClient]);

  return { login, logout };
};
