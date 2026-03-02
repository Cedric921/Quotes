import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { API_CONFIG } from "../../constants/config";
import { User, Quote } from "../../types";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { setUser } from "../../store/slices/authSlice";

// Query keys
export const userKeys = {
  all: ["user"] as const,
  detail: (id: string) => [...userKeys.all, id] as const,
  current: () => [...userKeys.all, "current"] as const,
  likedQuotes: () => [...userKeys.all, "liked-quotes"] as const,
  payments: () => [...userKeys.all, "payments"] as const,
};

// Fetch user by ID
export const useUser = (userId?: string) => {
  const token = useAppSelector((state) => state.auth.token);
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: userKeys.detail(userId || ""),
    queryFn: async () => {
      if (!userId || !token) {
        throw new Error("User ID and token are required");
      }

      const response = await axios.get<User>(
        `${API_CONFIG.getBaseUrl()}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Update Redux store with fresh user data
      dispatch(setUser(response.data));

      return response.data;
    },
    enabled: !!userId && !!token,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Fetch current authenticated user
export const useCurrentUser = () => {
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id;

  return useUser(userId);
};

// Hook to manually refresh user data
export const useRefreshUser = () => {
  const queryClient = useQueryClient();
  const user = useAppSelector((state) => state.auth.user);

  return () => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(user.id) });
    }
  };
};

// Payment type
export interface Payment {
  id: string;
  planName: string;
  amount: number;
  currency: string;
  status: string;
  stripePaymentIntentId?: string;
  paidAt: string;
  createdAt: string;
}

// Fetch user's liked quotes (favorites)
export const useLikedQuotes = () => {
  const token = useAppSelector((state) => state.auth.token);

  return useQuery({
    queryKey: userKeys.likedQuotes(),
    queryFn: async () => {
      if (!token) {
        throw new Error("Token is required");
      }

      const response = await axios.get<Quote[]>(
        `${API_CONFIG.getBaseUrl()}/users/me/liked-quotes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    },
    enabled: !!token,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Fetch user's payments
export const useUserPayments = () => {
  const token = useAppSelector((state) => state.auth.token);

  return useQuery({
    queryKey: userKeys.payments(),
    queryFn: async () => {
      if (!token) {
        throw new Error("Token is required");
      }

      const response = await axios.get<Payment[]>(
        `${API_CONFIG.getBaseUrl()}/subscriptions/my-payments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    },
    enabled: !!token,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Update user profile
export const useUpdateProfile = () => {
  const token = useAppSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  return useMutation({
    mutationFn: async (data: { name?: string; avatar?: string }) => {
      if (!token) {
        throw new Error("Token is required");
      }

      const response = await axios.patch<User>(
        `${API_CONFIG.getBaseUrl()}/users/me/profile`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    },
    onSuccess: (updatedUser) => {
      // Update Redux store
      dispatch(setUser(updatedUser));
      // Invalidate user queries
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: userKeys.detail(user.id) });
      }
    },
  });
};
