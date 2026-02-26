import { useQuery } from "@tanstack/react-query";
import { themesApi, BackgroundTheme } from "../../services/api";

// Query keys
export const themeKeys = {
  all: ["themes"] as const,
  active: () => [...themeKeys.all, "active"] as const,
};

// Fetch active themes (max 10)
export const useActiveThemes = () => {
  return useQuery<BackgroundTheme[]>({
    queryKey: themeKeys.active(),
    queryFn: () => themesApi.getActiveThemes(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

