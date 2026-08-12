import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { quotesApi } from "../../services/api";
import { userKeys } from "./useUser";
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    retry: 5, // More retries for cold starts on Render
    retryDelay: (attemptIndex) => Math.min(1000 * (attemptIndex + 1), 10000),
    // `refetchOnMount: "always"` rechargeait *toutes* les pages deja parcourues
    // a chaque retour sur l'accueil - dix requetes pour redescendre la meme
    // liste. Le defaut respecte `staleTime` : rien ne repart avant cinq minutes.
    refetchOnWindowFocus: false,
    enabled: true, // Always enabled - no conditions
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
  const token = useAppSelector((state) => state.auth.token);

  return useMutation({
    mutationFn: async ({
      quoteId,
      isLiked,
    }: {
      quoteId: string;
      isLiked: boolean;
    }) => {
      // Most readers have no account (spec §4: signing in is optional). For
      // them the optimistic update in `onMutate` *is* the like — it lives in
      // the query cache and the local quota — and there is no server to tell.
      // Calling the API anyway returned 401, rolled the heart back, and used
      // to reset the whole app.
      if (!token) return;

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
      // Surtout pas d'invalidation de `quoteKeys.all` : sur une liste infinie,
      // elle relance chaque page chargee - donc tout le flux - pour un seul
      // coeur tape. La mise a jour optimiste tient deja l'affichage, et le
      // rollback couvre l'echec. Seule la liste des favoris, qui change
      // vraiment de contenu, est invalidee.
      queryClient.invalidateQueries({ queryKey: userKeys.likedQuotes() });
    },
  });
};
