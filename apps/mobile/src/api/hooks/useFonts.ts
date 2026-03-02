import { useQuery } from "@tanstack/react-query";
import { fontsApi, FontItem } from "../../services/api";

// Query keys
export const fontKeys = {
  all: ["fonts"] as const,
  active: () => [...fontKeys.all, "active"] as const,
};

// Fetch active fonts (max 10)
export const useActiveFonts = () => {
  return useQuery<FontItem[]>({
    queryKey: fontKeys.active(),
    queryFn: () => fontsApi.getActiveFonts(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

