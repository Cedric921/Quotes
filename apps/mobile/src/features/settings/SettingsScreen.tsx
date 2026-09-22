import React from "react";
import { Linking, Platform, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useTranslation } from "react-i18next";
import { makeStyles } from "../../theme";
import {
  IconCircle,
  Sheet,
  SettingsRow,
  SettingsSection,
  Text,
  Toggle,
} from "../../ui";
import { useAppSelector } from "../../store/hooks";
import { useDisplayName } from "./useDisplayName";
import { useSocialNetworks } from "../../api/hooks/useSocial";
import { socialIcon } from "../../utils/iconMapper";
import {
  APP_VERSION,
  SOCIAL_URLS,
  SUPPORT_URL,
  legalPageUrl,
} from "../../constants/appConfig";
/**
 * The five the app ships with, used until the API answers — and if it never
 * does. Each keeps its own mark: a generic feed icon five times over reads as
 * one row repeated.
 */
const FALLBACK_SOCIALS = (
  Object.keys(SOCIAL_URLS) as (keyof typeof SOCIAL_URLS)[]
).map((key) => ({ id: key, name: key, url: SOCIAL_URLS[key] }));

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
  /** Opens a URL inside the app, titled by an i18n key. */
  onOpenPage: (url: string, titleKey: string) => void;
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
  onOpenPage,
  analyticsEnabled,
  onAnalyticsChange,
}: SettingsScreenProps) {
  const s = useStyles();
  const { t, i18n } = useTranslation();
  const user = useAppSelector((st) => st.auth.user);
  const isAuthenticated = useAppSelector((st) => st.auth.isAuthenticated);
  const name = useDisplayName();
  // The admin panel manages these; the constants are the offline answer.
  const { data: socials } = useSocialNetworks();
  const socialRows = socials?.length ? socials : FALLBACK_SOCIALS;

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
        <SettingsRow icon="person-outline" label={t("settings.name")} value={name || undefined} onPress={() => onOpen("Name")} />
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
        {socialRows.map((social) => (
          <SettingsRow
            key={social.id}
            icon={socialIcon(
              "icon" in social ? (social.icon as string) : undefined,
              social.name,
            )}
            // A network served by the API brings its own name; the shipped
            // five have a translated one.
            label={t(`settings.social.${social.name}`, {
              defaultValue: social.name,
            })}
            onPress={() => void Linking.openURL(social.url)}
          />
        ))}
      </SettingsSection>

      <SettingsSection title={t("settings.section.other")}>
        <SettingsRow
          icon="shield-checkmark-outline"
          label={t("settings.privacy")}
          onPress={() =>
            onOpenPage(
              legalPageUrl("privacy", i18n.language, Platform.OS),
              "settings.privacy",
            )
          }
        />
        <SettingsRow
          icon="document-text-outline"
          label={t("settings.terms")}
          onPress={() =>
            onOpenPage(
              legalPageUrl("terms", i18n.language, Platform.OS),
              "settings.terms",
            )
          }
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
          {/* Truncated in the middle, like the design: support asks for the
              end of the id as often as the start. */}
          <Text
            variant="caption"
            tone="dim"
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {t("settings.userId", { id: user?.id ?? "—" })}
          </Text>
        </View>
        {/*
          * A round icon button, not a `SettingsRow`: a row is built to fill a
          * list, so inside this card it expanded and squeezed the two lines of
          * text down to nothing — the card showed "Copy" and no version.
          */}
        <IconCircle
          icon="copy-outline"
          size={44}
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
