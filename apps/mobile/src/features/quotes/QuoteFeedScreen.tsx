import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  View,
  useWindowDimensions,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { makeStyles, useTheme } from "../../theme";
import { Button, Coachmark, IconCircle, Text } from "../../ui";
import { useAppSelector } from "../../store/hooks";
import { useQuotes } from "../../api/hooks/useQuotes";
import { QuoteSlide } from "./components/QuoteSlide";
import { QuoteActions } from "./components/QuoteActions";
import { LikeQuotaBar } from "./components/LikeQuotaBar";
import { LikeBurst } from "./components/LikeBurst";
import { FloatingNav } from "./components/FloatingNav";
import { StreakToast } from "./components/StreakToast";
import { FREE_LIKE_QUOTA } from "./likeQuotaSlice";
import { useQuoteLike } from "./useQuoteLike";
import { useWidgetSync } from "./useWidgetSync";
import { useStreak } from "../streak/useStreak";
import type { Quote } from "../../types";

const COACHMARK_KEY = "@focus_coachmark_like_v2";

/**
 * Keep pulling pages while the filter leaves fewer than this many quotes to
 * read. Without it, following one narrow topic empties a feed that has plenty
 * of matching quotes two pages down.
 */
const MIN_VISIBLE = 5;

const useStyles = makeStyles((t) => ({
  root: { flex: 1, backgroundColor: t.palette.ink900 },
  header: {
    position: "absolute",
    left: t.gutter,
    right: t.gutter,
    flexDirection: "row",
    alignItems: "center",
    gap: t.space.sm,
  },
  headerBar: { flex: 1, alignItems: "center" },
  actions: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: t.space.sm,
    paddingHorizontal: t.space.xxl,
  },
  emptyCta: { marginTop: t.space.lg, alignSelf: "stretch" },
}));

export interface QuoteFeedScreenProps {
  onOpenTopics: () => void;
  onOpenTheme: () => void;
  onOpenProfile: () => void;
  onOpenPaywall: () => void;
  onShare: (quote: Quote) => void;
}

/**
 * The permanent screen. Everything else in the app is a sheet on top of it.
 *
 * A vertical paging FlatList rather than a scroll of cards: one quote fills
 * the viewport, and the swipe is the only navigation the feed has.
 */
export function QuoteFeedScreen({
  onOpenTopics,
  onOpenTheme,
  onOpenProfile,
  onOpenPaywall,
  onShare,
}: QuoteFeedScreenProps) {
  const s = useStyles();
  const t = useTheme();
  const { t: translate } = useTranslation();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const backgroundTheme = useAppSelector((st) => st.theme.backgroundTheme);
  const isSubscribed = useAppSelector((st) => st.auth.user?.isSubscribed ?? false);
  const likesUsed = useAppSelector((st) => st.likeQuota.used);
  const followedTopics = useAppSelector((st) => st.settings.contentPreferences);
  const mutedTopics = useAppSelector((st) => st.settings.mutedTopics);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useQuotes(10, true);
  const like = useQuoteLike();
  const streak = useStreak();

  const loaded = useMemo<Quote[]>(() => data?.pages.flat() ?? [], [data]);

  /**
   * Both topic settings are applied here, on the client, because the API has
   * no notion of either yet (spec §8). Muting wins over following: a topic in
   * both lists is one the user asked twice not to see.
   *
   * A quote with no topic rides along only when nothing is followed — once
   * the user has named the subjects they want, an unclassified quote is not
   * one of them.
   */
  const quotes = useMemo<Quote[]>(() => {
    if (followedTopics.length === 0 && mutedTopics.length === 0) return loaded;

    return loaded.filter((quote) => {
      const topicId = quote.topic?.id;
      if (!topicId) return followedTopics.length === 0;
      if (mutedTopics.includes(topicId)) return false;
      return followedTopics.length === 0 || followedTopics.includes(topicId);
    });
  }, [loaded, followedTopics, mutedTopics]);

  const [index, setIndex] = useState(0);
  const [burst, setBurst] = useState(false);
  const [coachmark, setCoachmark] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const current = quotes[index];

  // The widgets are advertised in the profile grid and set up during the
  // funnel; without this they can only ever show their fallback text.
  useWidgetSync(quotes, current);

  // One visit per app open drives the streak; the toast fires off the slice.
  useEffect(() => {
    streak.recordVisit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (typeof first?.index === "number") setIndex(first.index);
    },
  ).current;

  const handleLike = useCallback(() => {
    if (!current) return;

    const outcome = like.toggle(current);
    if (outcome === "blocked") onOpenPaywall();
    if (outcome === "liked") setBurst(true);
  }, [current, like, onOpenPaywall]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // The filter runs after paging, so a page can arrive and add nothing to the
  // feed. `onEndReached` never fires in that case — there is nothing to reach
  // the end of — so the fetching is driven off the visible count instead.
  useEffect(() => {
    if (quotes.length < MIN_VISIBLE && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [quotes.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Everything the API gave us was filtered out, and no page is left to
  // rescue it: say so, and offer the way back rather than a blank screen the
  // user has to diagnose.
  //
  // `loaded.length > 0` is what separates "your settings hid everything" from
  // "the first page has not arrived yet" — both leave `quotes` empty, and only
  // one of them is the user's doing.
  const filteredEverythingOut =
    loaded.length > 0 &&
    quotes.length === 0 &&
    !hasNextPage &&
    !isFetchingNextPage;

  if (filteredEverythingOut) {
    return (
      <View style={s.root}>
        <View style={s.empty}>
          <Text variant="title" align="center">
            {translate("feed.empty.title")}
          </Text>
          <Text variant="body" tone="dim" align="center">
            {translate("feed.empty.body")}
          </Text>
          <Button
            label={translate("settings.contentPreferences")}
            onPress={onOpenTopics}
            style={s.emptyCta}
          />
        </View>

        <FloatingNav
          onTopics={onOpenTopics}
          onTheme={onOpenTheme}
          onProfile={onOpenProfile}
        />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <FlatList
        data={quotes}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={height}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        onEndReached={onEndReached}
        onEndReachedThreshold={2}
        getItemLayout={(_, i) => ({
          length: height,
          offset: height * i,
          index: i,
        })}
        renderItem={({ item }) => (
          <QuoteSlide
            quote={item}
            imageUri={backgroundTheme?.imageUrl}
            height={height}
          />
        )}
      />

      <LikeBurst playing={burst} onDone={() => setBurst(false)} />

      <View
        style={[s.header, { top: insets.top + t.space.xs }]}
        pointerEvents="box-none"
      >
        <View style={s.headerBar}>
          {!isSubscribed ? (
            <LikeQuotaBar used={likesUsed} total={FREE_LIKE_QUOTA} />
          ) : null}
        </View>
        <IconCircle
          icon="ribbon-outline"
          label={translate("paywall.open")}
          onPress={onOpenPaywall}
        />
      </View>

      <View
        style={[s.actions, { bottom: insets.bottom + 92 }]}
        pointerEvents="box-none"
      >
        <QuoteActions
          liked={!!current?.isLiked}
          onLike={handleLike}
          onShare={() => current && onShare(current)}
          onLikeLayout={(rect) =>
            setCoachmark((prev) =>
              prev ?? {
                ...rect,
                y: height - insets.bottom - 92 + rect.y,
              },
            )
          }
        />
      </View>

      <FloatingNav
        onTopics={onOpenTopics}
        onTheme={onOpenTheme}
        onProfile={onOpenProfile}
      />

      <StreakToast
        visible={streak.justAdvanced}
        count={streak.count}
        labels={streak.labels}
        completed={streak.completed}
        onHide={streak.dismissToast}
      />

      {coachmark && likesUsed === 0 ? (
        <Coachmark
          visible
          target={coachmark}
          message={translate("feed.coachmark", { count: FREE_LIKE_QUOTA })}
          onDismiss={() => setCoachmark(null)}
        />
      ) : null}
    </View>
  );
}

export { COACHMARK_KEY };
