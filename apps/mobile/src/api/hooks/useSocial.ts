import { useQuery } from "@tanstack/react-query";
import { socialApi, SocialNetwork } from "../../services/api";

// Query keys
export const socialKeys = {
  all: ["social"] as const,
  active: () => [...socialKeys.all, "active"] as const,
};

/**
 * Hook to fetch active social networks
 */
export const useSocialNetworks = () => {
  return useQuery<SocialNetwork[]>({
    queryKey: socialKeys.active(),
    queryFn: socialApi.getActiveSocials,
    staleTime: 1000 * 60 * 30, // 30 minutes - social links don't change often
  });
};

