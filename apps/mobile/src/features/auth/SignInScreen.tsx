import React, { useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { makeStyles } from "../../theme";
import { Button, Input, LinkButton, Sheet, Text } from "../../ui";
import { useAppDispatch } from "../../store/hooks";
import { loginThunk } from "../../store/slices/authSlice";
import { isEmail, notifyError, notifySuccess } from "./feedback";

const useStyles = makeStyles((t) => ({
  intro: { marginBottom: t.space.lg },
  fields: { gap: t.space.sm },
  cta: { marginTop: t.space.xl },
  links: { marginTop: t.space.md, gap: t.space.xxs },
}));

export interface SignInScreenProps {
  onBack: () => void;
  onSignUp: () => void;
  onForgotPassword: () => void;
}

/**
 * Signing in is optional in v2 — the feed works without an account. This
 * screen is reached from Settings › Compte, so it closes back to Settings
 * rather than resetting the stack the way v1's login did.
 */
export function SignInScreen({
  onBack,
  onSignUp,
  onForgotPassword,
}: SignInScreenProps) {
  const s = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const complete = isEmail(email) && password.length > 0;

  const submit = async () => {
    if (!complete) {
      notifyError("auth.fillAllFields");
      return;
    }

    setPending(true);
    try {
      await dispatch(
        loginThunk({ email: email.trim().toLowerCase(), password }),
      ).unwrap();
      notifySuccess("auth.loginSuccess", "auth.welcomeBack");
      onBack();
    } catch (error) {
      // The thunk rejects with the server's message, which is already a
      // sentence; anything else falls back to the generic key.
      notifyError(typeof error === "string" ? error : "auth.loginError");
    } finally {
      setPending(false);
    }
  };

  return (
    <Sheet title={t("auth.login")} onBack={onBack} collapsedOnly>
      <Text variant="body" tone="dim" style={s.intro}>
        {t("auth.loginToContinue")}
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
          onSubmitEditing={() => void submit()}
        />
      </View>

      <View style={s.cta}>
        <Button
          label={t("auth.login")}
          disabled={!complete}
          loading={pending}
          onPress={() => void submit()}
        />
      </View>

      <View style={s.links}>
        <LinkButton
          label={t("auth.forgotPassword")}
          onPress={onForgotPassword}
        />
        <LinkButton label={t("auth.createAccount")} onPress={onSignUp} />
      </View>
    </Sheet>
  );
}
