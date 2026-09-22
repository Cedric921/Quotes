import React, { useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { makeStyles } from "../../theme";
import { Button, Input, Sheet, Text } from "../../ui";
import { authErrorKey, useResetPassword } from "../../api/hooks/useAuth";
import {
  isEmail,
  notifyError,
  notifySuccess,
  passwordProblem,
} from "./feedback";

/** The code the API mails out. */
const CODE_LENGTH = 6;

const useStyles = makeStyles((t) => ({
  intro: { marginBottom: t.space.lg },
  fields: { gap: t.space.sm },
  cta: { marginTop: t.space.xl },
}));

export interface ResetPasswordScreenProps {
  onBack: () => void;
  /** Called once the password is changed — the caller sends the user to sign in. */
  onReset: () => void;
  /** Prefilled by the previous step; editable in case the address was wrong. */
  email?: string;
}

export function ResetPasswordScreen({
  onBack,
  onReset,
  email: initialEmail = "",
}: ResetPasswordScreenProps) {
  const s = useStyles();
  const { t } = useTranslation();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const resetPassword = useResetPassword();

  const complete =
    isEmail(email) &&
    code.trim().length === CODE_LENGTH &&
    password.length > 0 &&
    confirmation.length > 0;

  const submit = () => {
    if (!complete) {
      notifyError("auth.fillAllFields");
      return;
    }

    const problem = passwordProblem(password, confirmation);
    if (problem) {
      notifyError(problem);
      return;
    }

    resetPassword.mutate(
      { email, code, newPassword: password },
      {
        onSuccess: () => {
          notifySuccess(
            "auth.resetPasswordSuccess",
            "auth.resetPasswordSuccessMessage",
          );
          onReset();
        },
        onError: (error) => notifyError(authErrorKey(error)),
      },
    );
  };

  return (
    <Sheet title={t("auth.resetPasswordTitle")} onBack={onBack} collapsedOnly>
      <Text variant="body" tone="dim" style={s.intro}>
        {t("auth.resetPasswordSubtitle")}
      </Text>

      <View style={s.fields}>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder={t("auth.email")}
          label={t("auth.email")}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
        />
        <Input
          value={code}
          onChangeText={setCode}
          placeholder={t("auth.verificationCode")}
          label={t("auth.verificationCode")}
          autoCapitalize="none"
          autoComplete="sms-otp"
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          maxLength={CODE_LENGTH}
          returnKeyType="next"
        />
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder={t("auth.newPassword")}
          label={t("auth.newPassword")}
          revealLabel={t("auth.showPassword")}
          secure
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
        />
        <Input
          value={confirmation}
          onChangeText={setConfirmation}
          placeholder={t("auth.confirmNewPassword")}
          label={t("auth.confirmNewPassword")}
          revealLabel={t("auth.showPassword")}
          secure
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={submit}
        />
      </View>

      <View style={s.cta}>
        <Button
          label={t("auth.resetPasswordSubmit")}
          disabled={!complete}
          loading={resetPassword.isPending}
          onPress={submit}
        />
      </View>
    </Sheet>
  );
}
