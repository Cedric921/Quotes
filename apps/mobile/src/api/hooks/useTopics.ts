import { useQuery } from "@tanstack/react-query";
import { topicsApi } from "../../services/api";

// Query keys
export const topicKeys = {
  all: ["topics"] as const,
  lists: () => [...topicKeys.all, "list"] as const,
  list: (filters: any) => [...topicKeys.lists(), filters] as const,
  details: () => [...topicKeys.all, "detail"] as const,
  detail: (id: string) => [...topicKeys.details(), id] as const,
};

// Fetch all topics (now called subjects in UI)
export const useTopics = () => {
  return useQuery({
    queryKey: topicKeys.lists(),
    queryFn: async () => {
      console.log("[useTopics] Fetching topics/subjects");
      try {
        const result = await topicsApi.getTopics();
        console.log(`[useTopics] Received ${result?.length || 0} topics`);
        return result || [];
      } catch (error) {
        console.error("[useTopics] Error fetching topics:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour cache
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Fetch single topic
export const useTopic = (id: string) => {
  return useQuery({
    queryKey: topicKeys.detail(id),
    queryFn: () => topicsApi.getTopicById(id),
    enabled: !!id,
  });
};
