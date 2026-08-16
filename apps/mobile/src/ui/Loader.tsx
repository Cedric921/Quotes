import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useTranslation } from "react-i18next";
import { makeStyles, useTheme } from "../theme";
import { Text } from "./Text";
import { LinkButton } from "./Button";

const useStyles = makeStyles((t) => ({
  block: {
    alignItems: "center",
    justifyContent: "center",
    gap: t.space.sm,
    paddingVertical: t.space.huge,
  },
  fill: { flex: 1 },
  compact: { paddingVertical: t.space.md },
}));

export interface LoaderProps {
  /**
   * Takes the remaining height and centres in it — for a screen whose body is
   * the list being loaded. Without it the loader sits as a block at the top
   * of the content, which is what a scrolling sheet wants.
   */
  fill?: boolean;
  /** Shows "Chargement…" under the spinner. Off where the title already says what is coming. */
  withLabel?: boolean;
  /** A small spinner with little air — for one section of a longer page. */
  compact?: boolean;
}

/**
 * The wait before a list's first data arrives — and only that one.
 *
 * Screens show it when nothing is cached yet; a list restored from the disk
 * cache renders at once and refreshes underneath, without a spinner. The
 * colour follows the surface, so it reads on the metal and on a photo alike.
 */
export function Loader({ fill, withLabel, compact }: LoaderProps) {
  const s = useStyles();
  const t = useTheme();
  const { t: translate } = useTranslation();
  const label = translate("common.loading");

  return (
    <View
      style={[s.block, fill ? s.fill : null, compact ? s.compact : null]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
    >
      <ActivityIndicator size={compact ? "small" : "large"} color={t.fgDim} />
      {withLabel ? (
        <Text variant="caption" tone="dim">
          {label}
        </Text>
      ) : null}
    </View>
  );
}

export interface LoadFailedProps {
  onRetry: () => void;
  /** Same as `Loader`: takes the remaining height and centres in it. */
  fill?: boolean;
  /** Same as `Loader`: little air, for one section of a longer page. */
  compact?: boolean;
}

/**
 * Where the list would be when it could not be loaded and nothing is cached.
 *
 * Without it a failed request read as an empty list — "no results", "no
 * favourites yet" — which tells the user something false about their data.
 */
export function LoadFailed({ onRetry, fill, compact }: LoadFailedProps) {
  const s = useStyles();
  const { t } = useTranslation();

  return (
    <View
      style={[s.block, fill ? s.fill : null, compact ? s.compact : null]}
      accessibilityLiveRegion="polite"
    >
      <Text variant="body" tone="dim" align="center">
        {t("errors.connectionError")}
      </Text>
      <LinkButton icon="refresh-outline" label={t("common.retry")} onPress={onRetry} />
    </View>
  );
}
