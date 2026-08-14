import React, { useMemo } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { makeStyles } from "../../theme";
import { Sheet, SettingsRow, SettingsSection, Text } from "../../ui";
import { useAppSelector } from "../../store/hooks";
import { useStreak } from "../streak/useStreak";
import { UnlockBanner } from "./components/UnlockBanner";
import { StreakCard } from "./components/StreakCard";
import { FeatureGrid, type FeatureTile } from "./components/FeatureGrid";

/**
 * The profile's illustrations. Cut from the reference captures, keyed
 * against their tile ground and un-mixed, which is what turned the ink
 * objects silver: what is left is the glow and the highlights, and the
 * metal shows through the rest.
 */
const ART = {
  unlock: require("../../../assets/illustrations/profile/unlock.png"),
  flame: require("../../../assets/illustrations/profile/flame.png"),
  topics: require("../../../assets/illustrations/profile/topics.png"),
  wallpapers: require("../../../assets/illustrations/profile/wallpapers.png"),
  reminders: require("../../../assets/illustrations/profile/reminders.png"),
  homeWidgets: require("../../../assets/illustrations/profile/homeWidgets.png"),
  lockWidgets: require("../../../assets/illustrations/profile/lockWidgets.png"),
  appIcon: require("../../../assets/illustrations/profile/appIcon.png"),
  alarm: require("../../../assets/illustrations/profile/alarm.png"),
  watch: require("../../../assets/illustrations/profile/watch.png"),
  bundle: require("../../../assets/illustrations/profile/bundle.png"),
};

const useStyles = makeStyles((t) => ({
  block: { marginTop: t.space.lg },
  sectionTitle: { marginTop: t.space.xxl, marginBottom: t.space.md },
}));

export interface ProfileSheetProps {
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenLikedQuotes: () => void;
  onOpenPaywall: () => void;
  onOpenStreakSettings: () => void;
  onShareStreak: () => void;
  /** Feature tiles route into their own modal screens. */
  onOpen: (route: string) => void;
  /** The bundle tile opens a web page, not a screen. */
  onOpenBundle: () => void;
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
  onOpenLikedQuotes,
  onOpenPaywall,
  onOpenStreakSettings,
  onShareStreak,
  onOpen,
  onOpenBundle,
}: ProfileSheetProps) {
  const s = useStyles();
  const { t } = useTranslation();
  const isSubscribed = useAppSelector(
    (st) => st.auth.user?.isSubscribed ?? false,
  );
  const streak = useStreak();
  const likedCount = useAppSelector(
    (st) => st.auth.user?.likedQuotesCount ?? 0,
  );

  const tiles = useMemo<FeatureTile[]>(
    () => [
      {
        id: "topics",
        illustration: ART.topics,
        icon: "albums-outline",
        title: t("profile.tile.topics"),
        onPress: () => onOpen("ContentPreferences"),
      },
      {
        id: "wallpapers",
        illustration: ART.wallpapers,
        icon: "image-outline",
        title: t("profile.tile.wallpapers"),
        onPress: () => onOpen("ThemePicker"),
      },
      {
        id: "reminders",
        illustration: ART.reminders,
        icon: "notifications-outline",
        title: t("profile.tile.reminders"),
        onPress: () => onOpen("Reminders"),
      },
      {
        id: "homeWidgets",
        illustration: ART.homeWidgets,
        icon: "grid-outline",
        title: t("profile.tile.homeWidgets"),
        onPress: () => onOpen("HomeWidgets"),
      },
      {
        id: "lockWidgets",
        illustration: ART.lockWidgets,
        icon: "lock-closed-outline",
        title: t("profile.tile.lockWidgets"),
        onPress: () => onOpen("LockWidgets"),
      },
      {
        id: "appIcon",
        illustration: ART.appIcon,
        icon: "apps-outline",
        title: t("profile.tile.appIcon"),
        onPress: () => onOpen("AppIcon"),
      },
      // No alarm feature and no watch app exist yet. The slots stay in the
      // design; the tiles stay out of the build until there's something behind
      // them. Flip `enabled` when the native side lands.
      {
        id: "alarm",
        illustration: ART.alarm,
        icon: "alarm-outline",
        title: t("profile.tile.alarm"),
        enabled: false,
        onPress: () => undefined,
      },
      {
        id: "watch",
        illustration: ART.watch,
        icon: "watch-outline",
        title: t("profile.tile.watch"),
        enabled: false,
        onPress: () => undefined,
      },
      {
        id: "bundle",
        illustration: ART.bundle,
        icon: "cube-outline",
        title: t("profile.tile.bundle"),
        subtitle: t("profile.tile.bundleSubtitle"),
        wide: true,
        onPress: onOpenBundle,
      },
    ],
    [t, onOpen, onOpenBundle],
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
      {!isSubscribed ? (
        <UnlockBanner onPress={onOpenPaywall} illustration={ART.unlock} />
      ) : null}

      <View style={s.block}>
        <StreakCard
          illustration={ART.flame}
          count={streak.count}
          labels={streak.labels}
          completed={streak.completed}
          onShare={onShareStreak}
          onOptions={onOpenStreakSettings}
        />
      </View>

      {/*
       * The kept quotes sit above the customisation grid, and outside it: the
       * grid is "change how the app looks", this is the user's own content.
       */}
      <View style={s.block}>
        <SettingsSection>
          <SettingsRow
            icon="heart-outline"
            label={t("favorites.title")}
            value={likedCount > 0 ? String(likedCount) : undefined}
            onPress={onOpenLikedQuotes}
          />
        </SettingsSection>
      </View>

      <Text variant="title" style={s.sectionTitle}>
        {t("profile.customise")}
      </Text>
      <FeatureGrid tiles={tiles} />
    </Sheet>
  );
}
