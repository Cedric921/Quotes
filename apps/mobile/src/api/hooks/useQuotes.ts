import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { quotesApi } from "../../services/api";
import { Quote } from "../../types";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setUser } from "../../store/slices/authSlice";

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
// includePremium: false for non-authenticated users, true for authenticated users
export const useQuotes = (
  pageSize: number = 10,
  includePremium: boolean = true,
) => {
  return useInfiniteQuery({
    queryKey: quoteKeys.list({ pageSize, includePremium }),
    queryFn: async ({ pageParam = 1 }) => {
      const result = await quotesApi.getQuotes(
        pageParam,
        pageSize,
        undefined,
        includePremium,
      );
      return result || [];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < pageSize) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes - réduire les requêtes
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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

// Toggle like quote mutation with optimistic updates
export const useToggleLikeQuote = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  return useMutation({
    mutationFn: async ({
      quoteId,
      isLiked,
    }: {
      quoteId: string;
      isLiked: boolean;
    }) => {
      if (isLiked) {
        return quotesApi.unlikeQuote(quoteId);
      } else {
        return quotesApi.likeQuote(quoteId);
      }
    },
    onMutate: async ({ quoteId, isLiked }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: quoteKeys.all });

      // Snapshot the previous value
      const previousQuotes = queryClient.getQueriesData({
        queryKey: quoteKeys.all,
      });

      // Optimistically update all quote queries
      queryClient.setQueriesData({ queryKey: quoteKeys.all }, (old: any) => {
        if (!old) return old;

        // Handle infinite query data
        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: Quote[]) =>
              page.map((quote: Quote) =>
                quote.id === quoteId ? { ...quote, isLiked: !isLiked } : quote,
              ),
            ),
          };
        }

        // Handle regular query data (array of quotes)
        if (Array.isArray(old)) {
          return old.map((quote: Quote) =>
            quote.id === quoteId ? { ...quote, isLiked: !isLiked } : quote,
          );
        }

        return old;
      });

      // Optimistically update user's liked quotes count
      if (user) {
        const newCount = isLiked
          ? (user.likedQuotesCount || 0) - 1
          : (user.likedQuotesCount || 0) + 1;
        dispatch(setUser({ ...user, likedQuotesCount: Math.max(0, newCount) }));
      }

      // Return context with previous data for rollback
      return { previousQuotes, previousUser: user };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousQuotes) {
        context.previousQuotes.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousUser) {
        dispatch(setUser(context.previousUser));
      }
      console.error("Error toggling like:", err);
    },
    onSettled: () => {
      // Refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: quoteKeys.all });
    },
  });
};

// Legacy hooks for backward compatibility
export const useLikeQuote = () => {
  const toggleLike = useToggleLikeQuote();
  return {
    mutate: (quoteId: string) => toggleLike.mutate({ quoteId, isLiked: false }),
    mutateAsync: (quoteId: string) =>
      toggleLike.mutateAsync({ quoteId, isLiked: false }),
    ...toggleLike,
  };
};

export const useUnlikeQuote = () => {
  const toggleLike = useToggleLikeQuote();
  return {
    mutate: (quoteId: string) => toggleLike.mutate({ quoteId, isLiked: true }),
    mutateAsync: (quoteId: string) =>
      toggleLike.mutateAsync({ quoteId, isLiked: true }),
    ...toggleLike,
  };
};
