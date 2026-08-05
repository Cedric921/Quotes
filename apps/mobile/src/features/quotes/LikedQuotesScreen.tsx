import React from "react";
import { Alert, View } from "react-native";
import { useTranslation } from "react-i18next";
import { makeStyles } from "../../theme";
import { Card, IconCircle, Sheet, Text } from "../../ui";
import { useLikedQuotes } from "../../api/hooks/useUser";
import { useToggleLikeQuote } from "../../api/hooks/useQuotes";
import type { Quote } from "../../types";

const useStyles = makeStyles((t) => ({
  list: { gap: t.space.sm },
  row: { flexDirection: "row", alignItems: "flex-start", gap: t.space.md },
  copy: { flex: 1, gap: t.space.xs },
  empty: { alignItems: "center", gap: t.space.xs, marginTop: t.space.huge },
}));

export interface LikedQuotesScreenProps {
  onBack: () => void;
  /** Sharing is the main thing people do with a quote they kept. */
  onShare: (quote: Quote) => void;
}

/**
 * The quotes the user kept.
 *
 * Not in the reference captures — the app it models has no such screen — but
 * the like button, the free quota and `/users/me/liked-quotes` all already
 * exist, so the alternative was a heart that leads nowhere.
 *
 * The text is set in `body`, not `quote`: at 28px serif a list of ten reads
 * as ten posters. The serif belongs to the feed, where a quote is the whole
 * screen.
 */
export function LikedQuotesScreen({ onBack, onShare }: LikedQuotesScreenProps) {
  const s = useStyles();
  const { t } = useTranslation();
  const { data: quotes = [], isLoading } = useLikedQuotes();
  const toggleLike = useToggleLikeQuote();

  const confirmRemove = (quote: Quote) => {
    Alert.alert(t("favorites.removeTitle"), t("favorites.removeMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        // `isLiked: true` is the state before the tap: the mutation unlikes,
        // and its own invalidation drops the row from this list.
        onPress: () =>
          toggleLike.mutate({ quoteId: quote.id, isLiked: true }),
      },
    ]);
  };

  return (
    <Sheet title={t("favorites.title")} onBack={onBack} collapsedOnly>
      {quotes.length > 0 ? (
        <View style={s.list}>
          {quotes.map((quote) => (
            <Card key={quote.id}>
              <View style={s.row}>
                <View style={s.copy}>
                  <Text variant="body">{quote.text}</Text>
                  {quote.author ? (
                    <Text variant="caption" tone="tertiary">
                      {quote.author}
                    </Text>
                  ) : null}
                </View>
                {/* 40 rather than the default 52: two round buttons at full
                    size would out-weigh the quote they belong to. */}
                <IconCircle
                  icon="share-outline"
                  size={40}
                  label={t("common.send")}
                  onPress={() => onShare(quote)}
                />
                <IconCircle
                  icon="heart"
                  size={40}
                  label={t("favorites.removeTitle")}
                  onPress={() => confirmRemove(quote)}
                />
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <View style={s.empty}>
          <Text variant="title">
            {isLoading ? t("common.loading") : t("favorites.empty")}
          </Text>
          {!isLoading ? (
            <Text variant="body" tone="dim" align="center">
              {t("favorites.emptySubtext")}
            </Text>
          ) : null}
        </View>
      )}
    </Sheet>
  );
}
