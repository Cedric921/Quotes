import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { socialApi, SocialNetwork } from "@/services/api";

// Query keys
export const socialKeys = {
  all: ["social"] as const,
  lists: () => [...socialKeys.all, "list"] as const,
  list: (filters?: object) => [...socialKeys.lists(), filters] as const,
};

// Get all social networks
export const useSocialNetworks = () => {
  return useQuery({
    queryKey: socialKeys.list(),
    queryFn: socialApi.getAll,
  });
};

// Create social network
export const useCreateSocialNetwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<SocialNetwork>) => socialApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.lists() });
    },
  });
};

// Update social network
export const useUpdateSocialNetwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SocialNetwork> }) =>
      socialApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.lists() });
    },
  });
};

// Delete social network
export const useDeleteSocialNetwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => socialApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.lists() });
    },
  });
};

// Toggle social network active status
export const useToggleSocialNetworkActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => socialApi.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.lists() });
    },
  });
};

