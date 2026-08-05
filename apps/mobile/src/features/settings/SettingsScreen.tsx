import React from "react";
import { Linking, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useTranslation } from "react-i18next";
import { makeStyles } from "../../theme";
import { Sheet, SettingsRow, SettingsSection, Text, Toggle } from "../../ui";
import { useAppSelector } from "../../store/hooks";
import { APP_VERSION, SOCIAL_URLS, SUPPORT_URL, LEGAL_PRIVACY_URL, LEGAL_TERMS_URL } from "../../constants/appConfig";
import type { Ionicons } from "@expo/vector-icons";

/**
 * Each network keeps its own mark — a generic feed icon five times over reads
 * as one row repeated. X has no Ionicons glyph under its new name, so it
 * still comes through as the bird.
 */
const SOCIAL_ICONS: Record<
  keyof typeof SOCIAL_URLS,
  keyof typeof Ionicons.glyphMap
> = {
  instagram: "logo-instagram",
  tiktok: "logo-tiktok",
  facebook: "logo-facebook",
  pinterest: "logo-pinterest",
  x: "logo-twitter",
};

const useStyles = makeStyles((t) => ({
  version: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: t.space.md,
    marginTop: t.space.lg,
    padding: t.space.md,
    borderRadius: t.radius.md,
    borderWidth: t.border.hairline,
    borderColor: t.base.surfaceRaised,
  },
  versionCopy: { flex: 1, gap: t.space.xxs },
}));

export interface SettingsScreenProps {
  onBack: () => void;
  onOpen: (route: string) => void;
  analyticsEnabled: boolean;
  onAnalyticsChange: (value: boolean) => void;
}

/**
 * A flat, grouped list. Nothing here is a destination in its own right —
 * every row either opens a one-field sub-page or flips a switch.
 */
export function SettingsScreen({
  onBack,
  onOpen,
  analyticsEnabled,
  onAnalyticsChange,
}: SettingsScreenProps) {
  const s = useStyles();
  const { t } = useTranslation();
  const user = useAppSelector((st) => st.auth.user);
  const isAuthenticated = useAppSelector((st) => st.auth.isAuthenticated);

  return (
    <Sheet title={t("settings.title")} onBack={onBack} collapsedOnly>
      <SettingsSection title={t("settings.section.premium")}>
        <SettingsRow
          icon="ribbon-outline"
          label={t("settings.manageSubscription")}
          onPress={() => onOpen("ManageSubscription")}
        />
      </SettingsSection>

      <SettingsSection title={t("settings.section.aboutYou")}>
        <SettingsRow icon="person-outline" label={t("settings.name")} value={user?.name} onPress={() => onOpen("Name")} />
        <SettingsRow icon="male-female-outline" label={t("settings.gender")} onPress={() => onOpen("Gender")} />
        <SettingsRow icon="people-outline" label={t("settings.age")} onPress={() => onOpen("Age")} />
        <SettingsRow icon="heart-outline" label={t("settings.relationship")} onPress={() => onOpen("Relationship")} />
        <SettingsRow icon="sparkles-outline" label={t("settings.beliefs")} onPress={() => onOpen("Beliefs")} />
      </SettingsSection>

      <SettingsSection title={t("settings.section.personalise")}>
        <SettingsRow icon="book-outline" label={t("settings.contentPreferences")} onPress={() => onOpen("ContentPreferences")} />
        <SettingsRow icon="volume-mute-outline" label={t("settings.mutedContent")} onPress={() => onOpen("MutedContent")} />
        <SettingsRow icon="language-outline" label={t("settings.language")} onPress={() => onOpen("Language")} />
        <SettingsRow icon="volume-high-outline" label={t("settings.sound")} onPress={() => onOpen("Sound")} />
      </SettingsSection>

      <SettingsSection title={t("settings.section.account")}>
        <SettingsRow
          icon="person-circle-outline"
          label={isAuthenticated ? t("settings.account") : t("settings.signIn")}
          onPress={() => onOpen(isAuthenticated ? "Account" : "SignIn")}
        />
      </SettingsSection>

      <SettingsSection title={t("settings.section.support")}>
        <SettingsRow icon="share-outline" label={t("settings.shareApp")} onPress={() => onOpen("ShareApp")} />
        <SettingsRow icon="apps-outline" label={t("settings.moreApps")} onPress={() => onOpen("MoreApps")} />
        <SettingsRow icon="thumbs-up-outline" label={t("settings.review")} onPress={() => onOpen("Review")} />
      </SettingsSection>

      <SettingsSection title={t("settings.section.help")}>
        <SettingsRow
          icon="help-circle-outline"
          label={t("settings.help")}
          onPress={() => void Linking.openURL(SUPPORT_URL)}
        />
      </SettingsSection>

      <SettingsSection title={t("settings.section.follow")}>
        {(Object.keys(SOCIAL_URLS) as (keyof typeof SOCIAL_URLS)[]).map((key) => (
          <SettingsRow
            key={key}
            icon={SOCIAL_ICONS[key]}
            label={t(`settings.social.${key}`)}
            onPress={() => void Linking.openURL(SOCIAL_URLS[key])}
          />
        ))}
      </SettingsSection>

      <SettingsSection title={t("settings.section.other")}>
        <SettingsRow
          icon="shield-checkmark-outline"
          label={t("settings.privacy")}
          onPress={() => void Linking.openURL(LEGAL_PRIVACY_URL)}
        />
        <SettingsRow
          icon="document-text-outline"
          label={t("settings.terms")}
          onPress={() => void Linking.openURL(LEGAL_TERMS_URL)}
        />
        <SettingsRow
          label={t("settings.analytics")}
          accessory={
            <Toggle
              value={analyticsEnabled}
              onChange={onAnalyticsChange}
              label={t("settings.analytics")}
            />
          }
        />
      </SettingsSection>

      {/* Support asks for both of these, so they travel together and copy together. */}
      <View style={s.version}>
        <View style={s.versionCopy}>
          <Text variant="caption" tone="dim">
            {t("settings.version", { version: APP_VERSION })}
          </Text>
          <Text variant="caption" tone="dim" numberOfLines={1}>
            {t("settings.userId", { id: user?.id ?? "—" })}
          </Text>
        </View>
        <SettingsRow
          icon="copy-outline"
          label={t("common.copy")}
          onPress={() =>
            void Clipboard.setStringAsync(
              `${APP_VERSION} · ${user?.id ?? ""}`,
            )
          }
        />
      </View>
    </Sheet>
  );
}
