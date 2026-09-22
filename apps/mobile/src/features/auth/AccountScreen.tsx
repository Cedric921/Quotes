import React from "react";
import { Alert, View } from "react-native";
import { useTranslation } from "react-i18next";
import { makeStyles } from "../../theme";
import { Sheet, SettingsRow, SettingsSection, Text } from "../../ui";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutThunk } from "../../store/slices/authSlice";
import { notifySuccess } from "./feedback";

const useStyles = makeStyles((t) => ({
  identity: {
    marginBottom: t.space.xl,
    padding: t.space.md,
    gap: t.space.xxs,
    borderRadius: t.radius.lg,
    backgroundColor: t.base.bgElevated,
  },
}));

export interface AccountScreenProps {
  onBack: () => void;
  onDeleteAccount: () => void;
}

/**
 * What's left of v1's `ProfileScreen` once personalisation moved to the
 * profile sheet: who you're signed in as, and the two ways out.
 *
 * Signing out is a confirmation, not a row that fires — the account holds the
 * liked quotes and the subscription, and one stray tap in a settings list
 * shouldn't detach them.
 */
export function AccountScreen({ onBack, onDeleteAccount }: AccountScreenProps) {
  const s = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((st) => st.auth.user);

  const confirmLogout = () => {
    Alert.alert(t("settings.logout"), t("settings.logoutConfirmation"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("settings.logout"),
        style: "destructive",
        onPress: () => {
          void dispatch(logoutThunk());
          notifySuccess("settings.logout");
          onBack();
        },
      },
    ]);
  };

  return (
    <Sheet title={t("settings.account")} onBack={onBack} collapsedOnly>
      <View style={s.identity}>
        <Text variant="title">{user?.name ?? t("profile.title")}</Text>
        <Text variant="body" tone="dim">
          {user?.email ?? ""}
        </Text>
      </View>

      <SettingsSection>
        <SettingsRow
          icon="log-out-outline"
          label={t("settings.logout")}
          onPress={confirmLogout}
        />
      </SettingsSection>

      <SettingsSection title={t("settings.dangerZone")}>
        <SettingsRow
          icon="trash-outline"
          label={t("settings.deleteAccount")}
          destructive
          onPress={onDeleteAccount}
        />
      </SettingsSection>
    </Sheet>
  );
}
