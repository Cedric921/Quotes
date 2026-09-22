import React, { useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { makeStyles, useTheme } from "../../theme";
import { Button, Input, Sheet, Text } from "../../ui";
import { useAppDispatch } from "../../store/hooks";
import { logoutThunk } from "../../store/slices/authSlice";
import { authErrorKey, useDeleteAccount } from "../../api/hooks/useAuth";
import { notifyError, notifySuccess } from "./feedback";

const useStyles = makeStyles((t) => ({
  intro: { marginBottom: t.space.lg },
  warnings: { gap: t.space.md, marginBottom: t.space.xxl },
  warning: { flexDirection: "row", alignItems: "flex-start", gap: t.space.sm },
  warningText: { flex: 1 },
  cta: { marginTop: t.space.xl, gap: t.space.sm },
}));

export interface DeleteAccountScreenProps {
  onBack: () => void;
  /** Called once the account is gone — the caller leaves the settings stack. */
  onDeleted: () => void;
}

/**
 * Two steps, one screen: what you lose, then proof it's you.
 *
 * v1 did this in a 355-line transparent modal with its own step dots. The
 * steps are the screen here, which is also why the back chevron can undo step
 * two without unwinding the whole flow.
 */
export function DeleteAccountScreen({
  onBack,
  onDeleted,
}: DeleteAccountScreenProps) {
  const s = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const deleteAccount = useDeleteAccount();

  const submit = () => {
    if (!password.trim()) {
      notifyError("settings.passwordRequired");
      return;
    }

    deleteAccount.mutate(password, {
      onSuccess: () => {
        // The session is only cleared once the API confirms the deletion;
        // clearing it first would leave a wrong password looking like a
        // successful sign-out.
        void dispatch(logoutThunk());
        notifySuccess(
          "settings.accountDeleted",
          "settings.accountDeletedMessage",
        );
        onDeleted();
      },
      onError: (error) => notifyError(authErrorKey(error)),
    });
  };

  return (
    <Sheet
      title={t("settings.deleteAccountTitle")}
      onBack={confirming ? () => setConfirming(false) : onBack}
      collapsedOnly
    >
      {confirming ? (
        <>
          <Text variant="body" tone="dim" style={s.intro}>
            {t("settings.enterPasswordToDelete")}
          </Text>

          <Input
            value={password}
            onChangeText={setPassword}
            placeholder={t("auth.password")}
            label={t("auth.password")}
            revealLabel={t("auth.showPassword")}
            secure
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={submit}
          />

          <View style={s.cta}>
            <Button
              label={t("settings.deleteMyAccount")}
              variant="danger"
              disabled={password.trim().length === 0}
              loading={deleteAccount.isPending}
              onPress={submit}
            />
          </View>
        </>
      ) : (
        <>
          <Text variant="body" tone="dim" style={s.intro}>
            {t("settings.deleteAccountSubtitle")}
          </Text>

          <View style={s.warnings}>
            {[
              t("settings.deleteWarning1"),
              t("settings.deleteWarning2"),
              t("settings.deleteWarning3"),
            ].map((warning) => (
              <View key={warning} style={s.warning}>
                <Ionicons
                  name="alert-circle-outline"
                  size={22}
                  color={theme.base.danger}
                />
                <Text variant="body" style={s.warningText}>
                  {warning}
                </Text>
              </View>
            ))}
          </View>

          <View style={s.cta}>
            <Button
              label={t("settings.continue")}
              variant="danger"
              onPress={() => setConfirming(true)}
            />
          </View>
        </>
      )}
    </Sheet>
  );
}
