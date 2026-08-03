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
import { Coachmark, IconCircle } from "../../ui";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useQuotes, useToggleLikeQuote } from "../../api/hooks/useQuotes";
import { QuoteSlide } from "./components/QuoteSlide";
import { QuoteActions } from "./components/QuoteActions";
import { LikeQuotaBar } from "./components/LikeQuotaBar";
import { LikeBurst } from "./components/LikeBurst";
import { FloatingNav } from "./components/FloatingNav";
import { StreakToast } from "./components/StreakToast";
import {
  FREE_LIKE_QUOTA,
  increment,
  persistLikeQuota,
} from "./likeQuotaSlice";
import { useStreak } from "../streak/useStreak";
import type { Quote } from "../../types";

const COACHMARK_KEY = "@focus_coachmark_like_v2";

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
  const dispatch = useAppDispatch();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const backgroundTheme = useAppSelector((st) => st.theme.backgroundTheme);
  const isSubscribed = useAppSelector((st) => st.auth.user?.isSubscribed ?? false);
  const likesUsed = useAppSelector((st) => st.likeQuota.used);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useQuotes(10, true);
  const toggleLike = useToggleLikeQuote();
  const streak = useStreak();

  const quotes = useMemo<Quote[]>(
    () => data?.pages.flat() ?? [],
    [data],
  );

  const [index, setIndex] = useState(0);
  const [burst, setBurst] = useState(false);
  const [coachmark, setCoachmark] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const current = quotes[index];

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

  const quotaReached = !isSubscribed && likesUsed >= FREE_LIKE_QUOTA;

  const handleLike = useCallback(() => {
    if (!current) return;

    // Un-liking never costs quota, and never pushes the paywall.
    if (current.isLiked) {
      toggleLike.mutate(current.id);
      return;
    }
    if (quotaReached) {
      onOpenPaywall();
      return;
    }

    toggleLike.mutate(current.id);
    dispatch(increment());
    void dispatch(persistLikeQuota());
    setBurst(true);
  }, [current, quotaReached, toggleLike, dispatch, onOpenPaywall]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
