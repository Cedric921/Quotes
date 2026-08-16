import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fontsApi, Font } from "@/services/api";

// Query keys
export const fontKeys = {
  all: ["fonts"] as const,
  lists: () => [...fontKeys.all, "list"] as const,
  list: (filters?: object) => [...fontKeys.lists(), filters] as const,
  active: () => [...fontKeys.all, "active"] as const,
  details: () => [...fontKeys.all, "detail"] as const,
  detail: (id: string) => [...fontKeys.details(), id] as const,
};

// Get all fonts
export const useFonts = () => {
  return useQuery({
    queryKey: fontKeys.list(),
    queryFn: fontsApi.getAll,
  });
};

// Get active fonts only
export const useActiveFonts = () => {
  return useQuery({
    queryKey: fontKeys.active(),
    queryFn: fontsApi.getActive,
  });
};

// Create font
export const useCreateFont = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Font>) => fontsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fontKeys.lists() });
    },
  });
};

// Update font
export const useUpdateFont = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Font> }) =>
      fontsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fontKeys.lists() });
    },
  });
};

// Delete font
export const useDeleteFont = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fontsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fontKeys.lists() });
    },
  });
};

// Toggle font active status
export const useToggleFontActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fontsApi.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fontKeys.lists() });
    },
  });
};

// Mark a font as the default one (exclusive)
export const useSetDefaultFont = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fontsApi.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fontKeys.all });
    },
  });
};
