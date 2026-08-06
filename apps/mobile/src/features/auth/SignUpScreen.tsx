import React, { useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { makeStyles } from "../../theme";
import { Button, Input, LinkButton, Sheet, Text } from "../../ui";
import { useAppDispatch } from "../../store/hooks";
import { registerThunk } from "../../store/slices/authSlice";
import { useDisplayName } from "../settings/useDisplayName";
import {
  isEmail,
  notifyError,
  notifySuccess,
  passwordProblem,
} from "./feedback";

const useStyles = makeStyles((t) => ({
  intro: { marginBottom: t.space.lg },
  fields: { gap: t.space.sm },
  cta: { marginTop: t.space.xl },
  links: { marginTop: t.space.md },
}));

export interface SignUpScreenProps {
  onBack: () => void;
  onSignIn: () => void;
}

/**
 * The name is prefilled from the funnel when the user gave one: they already
 * answered that question, and asking twice is the fastest way to make an
 * account feel like paperwork.
 */
export function SignUpScreen({ onBack, onSignIn }: SignUpScreenProps) {
  const s = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [name, setName] = useState(useDisplayName());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);

  const complete =
    name.trim().length > 0 &&
    isEmail(email) &&
    password.length > 0 &&
    confirmation.length > 0;

  const submit = async () => {
    if (!complete) {
      notifyError("auth.fillAllFields");
      return;
    }

    const problem = passwordProblem(password, confirmation);
    if (problem) {
      notifyError(problem);
      return;
    }

    setPending(true);
    try {
      await dispatch(
        registerThunk({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      ).unwrap();
      notifySuccess("auth.signupSuccess", "auth.welcomeMessage");
      onBack();
    } catch (error) {
      notifyError(typeof error === "string" ? error : "auth.signupError");
    } finally {
      setPending(false);
    }
  };

  return (
    <Sheet title={t("auth.createAccount")} onBack={onBack} collapsedOnly>
      <Text variant="body" tone="dim" style={s.intro}>
        {t("auth.signupSubtitle")}
      </Text>

      <View style={s.fields}>
        <Input
          value={name}
          onChangeText={setName}
          placeholder={t("auth.name")}
          label={t("auth.name")}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
        />
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
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
        />
        <Input
          value={confirmation}
          onChangeText={setConfirmation}
          placeholder={t("auth.confirmPassword")}
          label={t("auth.confirmPassword")}
          revealLabel={t("auth.showPassword")}
          secure
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={() => void submit()}
        />
      </View>

      <View style={s.cta}>
        <Button
          label={t("auth.signup")}
          disabled={!complete}
          loading={pending}
          onPress={() => void submit()}
        />
      </View>

      <View style={s.links}>
        <LinkButton label={t("auth.alreadyHaveAccount")} onPress={onSignIn} />
      </View>
    </Sheet>
  );
}
