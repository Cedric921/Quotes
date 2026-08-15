import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { PersistQueryClientOptions } from "@tanstack/react-query-persist-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

/** A day: how long a fetched list stays in memory, and on disk, unobserved. */
const DAY = 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      // A day rather than ten minutes: a query dropped from memory is
      // dropped from the persisted cache too, and the point of persisting
      // is to still have last week's quotes when the API is asleep.
      gcTime: DAY,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * What survives a restart: the lists the app is made of. Everything else —
 * the user, the subscription, a single quote by id — is either sensitive,
 * short-lived, or cheap to ask for again.
 */
const PERSISTED_ROOTS = ["quotes", "themes", "topics", "fonts"] as const;

/** The persisted feed pages, for anyone who needs quotes without the network. */
export const CACHED_QUOTES_KEY = ["quotes", "list"] as const;

/**
 * The cache on disk.
 *
 * On a cold start the feed used to be black until `/quotes` answered, and
 * stayed black when it did not — the API sleeps on its free tier. The
 * query cache is now written to AsyncStorage as it changes and read back
 * before the first render, so the screen shows what it showed last time
 * and refreshes underneath once the network comes through. React Query's
 * own rules do the rest: restored data past `staleTime` refetches, a failed
 * refetch keeps the data on screen.
 */
export const persistOptions: Omit<PersistQueryClientOptions, "queryClient"> = {
  persister: createAsyncStoragePersister({
    storage: AsyncStorage,
    key: "focus-query-cache",
    throttleTime: 1000,
  }),
  maxAge: 7 * DAY,
  // A new app version drops the old cache: a changed shape would otherwise
  // reach screens that no longer expect it.
  buster: Constants.expoConfig?.version ?? "dev",
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      query.state.status === "success" &&
      PERSISTED_ROOTS.includes(
        query.queryKey[0] as (typeof PERSISTED_ROOTS)[number],
      ),
  },
};
