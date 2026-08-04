import React, { useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { makeStyles } from "../../theme";
import { Button, Input, Sheet, Text } from "../../ui";
import { authErrorKey, useForgotPassword } from "../../api/hooks/useAuth";
import { isEmail, notifyError, notifySuccess } from "./feedback";

const useStyles = makeStyles((t) => ({
  intro: { marginBottom: t.space.lg },
  cta: { marginTop: t.space.xl },
}));

export interface ForgotPasswordScreenProps {
  onBack: () => void;
  /** Hands the address to the reset screen so it isn't typed twice. */
  onCodeSent: (email: string) => void;
}

export function ForgotPasswordScreen({
  onBack,
  onCodeSent,
}: ForgotPasswordScreenProps) {
  const s = useStyles();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const forgotPassword = useForgotPassword();

  const valid = isEmail(email);

  const submit = () => {
    if (!valid) {
      notifyError("auth.fillAllFields");
      return;
    }

    forgotPassword.mutate(email, {
      onSuccess: () => {
        notifySuccess("auth.resetCodeSent", "auth.resetCodeSentMessage");
        onCodeSent(email.trim().toLowerCase());
      },
      onError: (error) => notifyError(authErrorKey(error)),
    });
  };

  return (
    <Sheet title={t("auth.forgotPasswordTitle")} onBack={onBack} collapsedOnly>
      <Text variant="body" tone="dim" style={s.intro}>
        {t("auth.forgotPasswordSubtitle")}
      </Text>

      <Input
        value={email}
        onChangeText={setEmail}
        placeholder={t("auth.email")}
        label={t("auth.email")}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={submit}
      />

      <View style={s.cta}>
        <Button
          label={t("auth.sendResetCode")}
          disabled={!valid}
          loading={forgotPassword.isPending}
          onPress={submit}
        />
      </View>
    </Sheet>
  );
}
