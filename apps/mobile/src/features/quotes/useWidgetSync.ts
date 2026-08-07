import { useEffect, useRef } from "react";
import { widgetService } from "../../services/widgetService";
import type { Quote } from "../../types";

/** How many quotes the widget keeps to rotate through on its own. */
const POOL_SIZE = 30;

const toWidgetQuote = (quote: Quote) => ({
  content: quote.text,
  author: quote.author,
  topicName: quote.topic?.name,
});

/**
 * Keeps the home-screen and lock-screen widgets fed from the feed.
 *
 * Two writes, for two behaviours: the quote on screen, so the widget matches
 * what the user is reading, and a pool the widget rotates through by itself
 * between app launches.
 *
 * Both are skipped when nothing changed — the feed re-renders on every swipe,
 * and each write crosses the native bridge and asks the OS to redraw.
 */
export function useWidgetSync(quotes: Quote[], current?: Quote) {
  const lastQuoteId = useRef<string | null>(null);
  const lastPool = useRef<string>("");

  useEffect(() => {
    if (!current || current.id === lastQuoteId.current) return;
    lastQuoteId.current = current.id;
    void widgetService.updateWidgetQuote(toWidgetQuote(current));
  }, [current]);

  useEffect(() => {
    if (quotes.length === 0) return;

    const pool = quotes.slice(0, POOL_SIZE);
    const signature = pool.map((quote) => quote.id).join("|");
    if (signature === lastPool.current) return;

    lastPool.current = signature;
    void widgetService.updateWidgetQuotes(pool.map(toWidgetQuote));
  }, [quotes]);
}
