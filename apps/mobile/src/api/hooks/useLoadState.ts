import { useIsRestoring } from "@tanstack/react-query";

/** The slice of a query result this hook reads — any `useQuery` result fits. */
interface QueryLike {
  data: unknown;
  status: "pending" | "error" | "success";
  fetchStatus: "fetching" | "paused" | "idle";
  refetch: () => unknown;
}

export interface LoadState {
  /**
   * Nothing to show yet and something is coming: no data in memory or in
   * the disk cache, and either the cache is still being read back or a
   * request is in flight — the first one, or a retry after a failure.
   */
  loading: boolean;
  /** Nothing to show and nothing coming: the last attempt failed. */
  failed: boolean;
  retry: () => void;
}

/**
 * What a list screen should show before its data: a spinner, an error with
 * a retry, or the list.
 *
 * Cached data always wins — a list restored from the disk renders at once
 * and refreshes underneath, without a spinner. A disabled query (no token,
 * say) is neither loading nor failed: the screen shows its empty state.
 *
 * `isPending` alone is not enough: after a failure the query stays in
 * `error` while it retries, so the spinner would never come back, and the
 * screen would read "no results" when it means "could not load".
 */
export function useLoadState(query: QueryLike): LoadState {
  const isRestoring = useIsRestoring();
  const empty = query.data === undefined;
  const loading = empty && (isRestoring || query.fetchStatus === "fetching");
  return {
    loading,
    failed: empty && !loading && query.status === "error",
    retry: () => void query.refetch(),
  };
}
