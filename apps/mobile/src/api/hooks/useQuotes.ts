import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { quotesApi } from "../../services/api";

// Query keys
export const quoteKeys = {
  all: ["quotes"] as const,
  lists: () => [...quoteKeys.all, "list"] as const,
  list: (filters: any) => [...quoteKeys.lists(), filters] as const,
  details: () => [...quoteKeys.all, "detail"] as const,
  detail: (id: string) => [...quoteKeys.details(), id] as const,
  byTopic: (topicId: string) => [...quoteKeys.all, "topic", topicId] as const,
};

// Fetch all quotes with pagination
export const useQuotes = (pageSize: number = 10) => {
  return useInfiniteQuery({
    queryKey: quoteKeys.list({ pageSize }),
    queryFn: ({ pageParam = 1 }) => quotesApi.getQuotes(pageParam, pageSize),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < pageSize) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
};

// Fetch quotes by topic
export const useQuotesByTopic = (topicId: string) => {
  return useQuery({
    queryKey: quoteKeys.byTopic(topicId),
    queryFn: () => quotesApi.getQuotesByTopic(topicId),
    enabled: !!topicId,
  });
};

// Fetch single quote
export const useQuote = (id: string) => {
  return useQuery({
    queryKey: quoteKeys.detail(id),
    queryFn: () => quotesApi.getQuoteById(id),
    enabled: !!id,
  });
};

// Like quote mutation
export const useLikeQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quoteId: string) => quotesApi.likeQuote(quoteId),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: quoteKeys.all });
    },
  });
};

// Unlike quote mutation
export const useUnlikeQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quoteId: string) => quotesApi.unlikeQuote(quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.all });
    },
  });
};
