import React, { useMemo } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { makeStyles } from "../../theme";
import { Sheet, Text } from "../../ui";
import { useAppSelector } from "../../store/hooks";
import { useStreak } from "../streak/useStreak";
import { UnlockBanner } from "./components/UnlockBanner";
import { StreakCard } from "./components/StreakCard";
import { FeatureGrid, type FeatureTile } from "./components/FeatureGrid";

const useStyles = makeStyles((t) => ({
  block: { marginTop: t.space.lg },
  sectionTitle: { marginTop: t.space.xxl, marginBottom: t.space.md },
}));

export interface ProfileSheetProps {
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenPaywall: () => void;
  onOpenStreakSettings: () => void;
  onShareStreak: () => void;
  /** Feature tiles route into their own modal screens. */
  onOpen: (route: string) => void;
}

/**
 * The hub, presented as a sheet over the feed.
 *
 * v1 put everything in a 906-line settings screen. Here the two are split by
 * intent: this sheet is "make the app mine" (what the user came for), and
 * Settings behind the gear is "change a value" (what they need occasionally).
 */
export function ProfileSheet({
  onClose,
  onOpenSettings,
  onOpenPaywall,
  onOpenStreakSettings,
  onShareStreak,
  onOpen,
}: ProfileSheetProps) {
  const s = useStyles();
  const { t } = useTranslation();
  const isSubscribed = useAppSelector((st) => st.auth.user?.isSubscribed ?? false);
  const streak = useStreak();

  const tiles = useMemo<FeatureTile[]>(
    () => [
      { id: "topics", title: t("profile.tile.topics"), onPress: () => onOpen("Topics") },
      { id: "wallpapers", title: t("profile.tile.wallpapers"), onPress: () => onOpen("Wallpapers") },
      { id: "reminders", title: t("profile.tile.reminders"), onPress: () => onOpen("Reminders") },
      { id: "homeWidgets", title: t("profile.tile.homeWidgets"), onPress: () => onOpen("HomeWidgets") },
      { id: "lockWidgets", title: t("profile.tile.lockWidgets"), onPress: () => onOpen("LockWidgets") },
      { id: "appIcon", title: t("profile.tile.appIcon"), onPress: () => onOpen("AppIcon") },
      { id: "alarm", title: t("profile.tile.alarm"), onPress: () => onOpen("Alarm") },
      { id: "watch", title: t("profile.tile.watch"), onPress: () => onOpen("Watch") },
      {
        id: "bundle",
        title: t("profile.tile.bundle"),
        subtitle: t("profile.tile.bundleSubtitle"),
        wide: true,
        onPress: () => onOpen("Bundle"),
      },
    ],
    [t, onOpen],
  );

  return (
    <Sheet
      title={t("profile.title")}
      onClose={onClose}
      action={{
        icon: "settings-outline",
        label: t("settings.title"),
        onPress: onOpenSettings,
      }}
    >
      {!isSubscribed ? <UnlockBanner onPress={onOpenPaywall} /> : null}

      <View style={s.block}>
        <StreakCard
          count={streak.count}
          labels={streak.labels}
          completed={streak.completed}
          onShare={onShareStreak}
          onOptions={onOpenStreakSettings}
        />
      </View>

      <Text variant="title" style={s.sectionTitle}>
        {t("profile.customise")}
      </Text>
      <FeatureGrid tiles={tiles} />
    </Sheet>
  );
}
