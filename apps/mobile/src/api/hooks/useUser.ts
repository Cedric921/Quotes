import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_CONFIG } from "../../constants/config";
import { User } from "../../types";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { setUser } from "../../store/slices/authSlice";

// Query keys
export const userKeys = {
  all: ["user"] as const,
  detail: (id: string) => [...userKeys.all, id] as const,
  current: () => [...userKeys.all, "current"] as const,
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

