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

// Fetch all topics
export const useTopics = () => {
  return useQuery({
    queryKey: topicKeys.lists(),
    queryFn: () => topicsApi.getTopics(),
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
