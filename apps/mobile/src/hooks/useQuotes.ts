import { useState, useCallback } from 'react';
import { quotesApi } from '../services/api';
import { Quote } from '../types';

interface UseQuotesOptions {
  pageSize?: number;
  topicId?: number;
}

interface UseQuotesReturn {
  quotes: Quote[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  error: Error | null;
  fetchQuotes: (pageNum: number, refresh?: boolean) => Promise<void>;
  loadMore: () => void;
  refresh: () => void;
  likeQuote: (quoteId: number) => Promise<void>;
}

export const useQuotes = (options: UseQuotesOptions = {}): UseQuotesReturn => {
  const { pageSize = 10, topicId } = options;

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuotes = useCallback(async (pageNum: number, refresh = false) => {
    if (loading || (!hasMore && !refresh)) return;

    setLoading(true);
    setError(null);

    try {
      const newQuotes = await quotesApi.getQuotes(pageNum, pageSize, topicId);

      if (refresh) {
        setQuotes(newQuotes);
        setPage(1);
        setHasMore(newQuotes.length === pageSize);
      } else {
        setQuotes(prev => [...prev, ...newQuotes]);
        setHasMore(newQuotes.length === pageSize);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch quotes');
      setError(error);
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading, hasMore, pageSize, topicId]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchQuotes(nextPage);
    }
  }, [loading, hasMore, page, fetchQuotes]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setHasMore(true);
    setPage(1);
    fetchQuotes(1, true);
  }, [fetchQuotes]);

  const likeQuote = useCallback(async (quoteId: number) => {
    try {
      await quotesApi.likeQuote(quoteId);
      console.log('Quote liked:', quoteId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to like quote');
      console.error('Error liking quote:', error);
      throw error;
    }
  }, []);

  return {
    quotes,
    loading,
    refreshing,
    hasMore,
    error,
    fetchQuotes,
    loadMore,
    refresh,
    likeQuote,
  };
};

