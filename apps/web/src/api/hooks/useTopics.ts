import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { topicsApi, Topic } from "@/services/api";

// Query keys
export const topicKeys = {
  all: ["topics"] as const,
  lists: () => [...topicKeys.all, "list"] as const,
  list: (filters?: object) => [...topicKeys.lists(), filters] as const,
  details: () => [...topicKeys.all, "detail"] as const,
  detail: (id: string) => [...topicKeys.details(), id] as const,
};

// Get all topics
export const useTopics = () => {
  return useQuery({
    queryKey: topicKeys.list(),
    queryFn: topicsApi.getAll,
  });
};

// Create topic
export const useCreateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Topic>) => topicsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
    },
  });
};

// Update topic
export const useUpdateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Topic> }) =>
      topicsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
    },
  });
};

// Delete topic
export const useDeleteTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => topicsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
    },
  });
};

