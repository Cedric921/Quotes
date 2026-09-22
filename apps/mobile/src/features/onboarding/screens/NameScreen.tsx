import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button, Input, Screen, Text } from "../../../ui";
import { makeStyles } from "../../../theme";
import { useAppDispatch } from "../../../store/hooks";
import { next, setFirstName } from "../store/onboardingSlice";

const useStyles = makeStyles((t) => ({
  title: { marginTop: t.space.xxl, marginBottom: t.space.xl },
  body: { flex: 1 },
}));

/**
 * The first name is the highest-value answer in the whole funnel: it comes
 * back on the mood question, on the personalised quote and in every reminder.
 * So it gets its own step rather than sitting inside a form.
 */
export function NameScreen() {
  const s = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [value, setValue] = useState("");

  const submit = () => {
    dispatch(setFirstName(value.trim()));
    dispatch(next());
  };

  return (
    <Screen
      footer={
        <Button
          label={t("common.continue")}
          disabled={value.trim().length === 0}
          onPress={submit}
        />
      }
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.body}
      >
        <Text variant="display" align="center" style={s.title}>
          {t("onboarding.name.title")}
        </Text>
        <Input
          value={value}
          onChangeText={setValue}
          placeholder={t("onboarding.name.placeholder")}
          autoFocus
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={submit}
          label={t("onboarding.name.title")}
        />
        <View style={s.body} />
      </KeyboardAvoidingView>
    </Screen>
  );
}
