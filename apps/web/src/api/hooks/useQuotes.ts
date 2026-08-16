import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quotesApi, Quote, QuoteImportItem } from "@/services/api";

// Query keys
export const quoteKeys = {
  all: ["quotes"] as const,
  lists: () => [...quoteKeys.all, "list"] as const,
  list: (filters?: object) => [...quoteKeys.lists(), filters] as const,
  details: () => [...quoteKeys.all, "detail"] as const,
  detail: (id: string) => [...quoteKeys.details(), id] as const,
};

// Get all quotes
export const useQuotes = () => {
  return useQuery({
    queryKey: quoteKeys.list(),
    queryFn: quotesApi.getAll,
  });
};

// Create quote
export const useCreateQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Quote>) => quotesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
};

// Update quote
export const useUpdateQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Quote> }) =>
      quotesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
};

// Delete quote
export const useDeleteQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
};

// Bulk import quotes
export const useBulkImportQuotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      topicId,
      quotes,
    }: {
      topicId: string;
      quotes: QuoteImportItem[];
    }) => quotesApi.bulkImport(topicId, quotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
  });
};
