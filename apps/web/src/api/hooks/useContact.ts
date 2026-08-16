import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactApi } from "@/services/api";

// Query keys
export const contactKeys = {
  all: ["contact"] as const,
  lists: () => [...contactKeys.all, "list"] as const,
  list: (filters?: object) => [...contactKeys.lists(), filters] as const,
  details: () => [...contactKeys.all, "detail"] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
};

// Get all contact messages
export const useContactMessages = () => {
  return useQuery({
    queryKey: contactKeys.list(),
    queryFn: contactApi.getAll,
  });
};

// Get single contact message
export const useContactMessage = (id: string) => {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => contactApi.getById(id),
    enabled: !!id,
  });
};

// Mark as unread
export const useMarkContactAsUnread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contactApi.markAsUnread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
    },
  });
};

// Delete contact message
export const useDeleteContactMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contactApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
    },
  });
};

