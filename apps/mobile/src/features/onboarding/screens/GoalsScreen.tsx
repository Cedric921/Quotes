import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button, LinkButton, Screen, Text, TextArea } from "../../../ui";
import { makeStyles } from "../../../theme";
import { useAppDispatch } from "../../../store/hooks";
import { next, setGoals } from "../store/onboardingSlice";

const MAX = 250;

const useStyles = makeStyles((t) => ({
  top: { minHeight: 36, justifyContent: "center" },
  title: { marginTop: t.space.lg, marginBottom: t.space.xl },
  body: { flex: 1 },
  cta: { marginTop: t.space.xxl },
}));

/**
 * The only free-text step. The CTA stays disabled until something is typed —
 * an empty submission here would poison the personalised plan card that
 * quotes it back three screens later.
 */
export function GoalsScreen() {
  const s = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [value, setValue] = useState("");

  const submit = () => {
    dispatch(setGoals(value.trim()));
    dispatch(next());
  };

  return (
    <Screen
      header={
        <View style={s.top}>
          <LinkButton
            label={t("common.skip")}
            align="end"
            onPress={() => dispatch(next())}
          />
        </View>
      }
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.body}
      >
        <Text variant="display" align="center" style={s.title}>
          {t("onboarding.goals.title")}
        </Text>

        <TextArea
          value={value}
          onChangeText={setValue}
          maxLength={MAX}
          placeholder={t("onboarding.goals.placeholder")}
          autoFocus
          label={t("onboarding.goals.title")}
        />

        <View style={s.cta}>
          <Button
            label={t("onboarding.goals.save")}
            disabled={value.trim().length === 0}
            onPress={submit}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
