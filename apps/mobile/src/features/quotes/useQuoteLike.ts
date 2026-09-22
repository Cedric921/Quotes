import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useToggleLikeQuote } from "../../api/hooks/useQuotes";
import {
  FREE_LIKE_QUOTA,
  decrement,
  increment,
  persistLikeQuota,
} from "./likeQuotaSlice";
import type { Quote } from "../../types";

/** What the tap did, so the caller can decide what to show for it. */
export type LikeOutcome = "liked" | "unliked" | "blocked";

/**
 * Liking a quote, in one place.
 *
 * Two surfaces do it — the heart on the feed and "Ajouter à collection" in
 * the share sheet — and both owe the same three rules: un-liking is always
 * free and gives the slot back, a like past the free quota opens the paywall
 * instead, and a like that goes through spends one of the five. Written
 * twice, the second copy is the one that forgets the quota.
 */
export function useQuoteLike() {
  const dispatch = useAppDispatch();
  const toggleLike = useToggleLikeQuote();
  const isSubscribed = useAppSelector(
    (st) => st.auth.user?.isSubscribed ?? false,
  );
  const likesUsed = useAppSelector((st) => st.likeQuota.used);

  const quotaReached = !isSubscribed && likesUsed >= FREE_LIKE_QUOTA;

  const toggle = useCallback(
    (quote: Quote): LikeOutcome => {
      // `isLiked` is the state *before* the tap — the mutation flips it.
      if (quote.isLiked) {
        // The slot comes back. Without this a free account that liked five
        // quotes and removed them all sat at 5/5 with nothing in it, unable
        // to like anything again — `decrement` was written for this and
        // never called.
        toggleLike.mutate(
          { quoteId: quote.id, isLiked: true },
          {
            onSuccess: () => {
              dispatch(decrement());
              void dispatch(persistLikeQuota());
            },
          },
        );
        return "unliked";
      }

      if (quotaReached) return "blocked";

      // Spent on success, not on the tap: a like the server refuses is
      // rolled back by the mutation, and a slot spent on it would be gone
      // for nothing.
      toggleLike.mutate(
        { quoteId: quote.id, isLiked: false },
        {
          onSuccess: () => {
            dispatch(increment());
            void dispatch(persistLikeQuota());
          },
        },
      );
      return "liked";
    },
    [quotaReached, toggleLike, dispatch],
  );

  return { toggle, quotaReached, likesUsed, isSubscribed };
}
