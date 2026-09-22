import React from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button, Card, Screen, Text } from "../../../ui";
import { makeStyles } from "../../../theme";
import { useAppDispatch } from "../../../store/hooks";
import { next } from "../store/onboardingSlice";
import { StreakWeek } from "../../streak/StreakWeek";
import { useStreak } from "../../streak/useStreak";

const useStyles = makeStyles((t) => ({
  body: { flex: 1, justifyContent: "center", gap: t.space.xxl },
  copy: { gap: t.space.sm },
}));

/**
 * The only celebratory beat in the funnel, and the one place the gradient CTA
 * earns its keep: the user has just committed to a daily habit.
 */
export function StreakIntroScreen() {
  const s = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { count, labels, completed } = useStreak();

  return (
    <Screen
      footer={
        <Button
          variant="gradient"
          label={t("common.continue")}
          onPress={() => dispatch(next())}
        />
      }
    >
      <View style={s.body}>
        <Card>
          <StreakWeek
            count={Math.max(count, 1)}
            labels={labels}
            completed={completed.length ? completed : [0]}
          />
        </Card>

        <View style={s.copy}>
          <Text variant="display" align="center">
            {t("onboarding.streak.title")}
          </Text>
          <Text variant="body" tone="dim" align="center">
            {t("onboarding.streak.subtitle")}
          </Text>
        </View>
      </View>
    </Screen>
  );
}
