import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { themesApi, Theme } from "@/services/api";

// Query keys
export const themeKeys = {
  all: ["themes"] as const,
  lists: () => [...themeKeys.all, "list"] as const,
  list: (filters?: object) => [...themeKeys.lists(), filters] as const,
  details: () => [...themeKeys.all, "detail"] as const,
  detail: (id: string) => [...themeKeys.details(), id] as const,
};

// Get all themes
export const useThemes = () => {
  return useQuery({
    queryKey: themeKeys.list(),
    queryFn: themesApi.getAll,
  });
};

// Create theme
export const useCreateTheme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => themesApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: themeKeys.lists() });
    },
  });
};

// Update theme
export const useUpdateTheme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      themesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: themeKeys.lists() });
    },
  });
};

// Delete theme
export const useDeleteTheme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => themesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: themeKeys.lists() });
    },
  });
};

// Toggle theme active status
export const useToggleThemeActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => themesApi.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: themeKeys.lists() });
    },
  });
};
