import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Button, Screen, Text } from "../../../ui";
import { makeStyles, useTheme } from "../../../theme";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { next } from "../store/onboardingSlice";

const useStyles = makeStyles(() => ({
  centre: { flex: 1, alignItems: "center", justifyContent: "center" },
  swipe: { alignItems: "center", paddingBottom: 24 },
}));

/**
 * First look at the product: the chosen theme, in the chosen font, with the
 * user's own name in the line. Everything the funnel collected, paid off in
 * one screen.
 */
export function PersonalQuoteScreen() {
  const s = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const firstName = useAppSelector((st) => st.onboarding.firstName);
  const theme = useAppSelector((st) => st.theme.backgroundTheme);

  return (
    <Screen
      variant="image"
      imageUri={theme?.imageUrl}
      footer={
        <Button label={t("common.continue")} onPress={() => dispatch(next())} />
      }
    >
      <View style={s.centre}>
        <Text variant="quote" align="center">
          {t("onboarding.personalQuote.line", { name: firstName })}
        </Text>
      </View>
    </Screen>
  );
}

/**
 * Hand-off to the feed. No button — the gesture it teaches is the gesture the
 * feed runs on, so the screen is dismissed by performing it.
 */
export function WelcomeScreen({ onEnter }: { onEnter: () => void }) {
  const s = useStyles();
  const t2 = useTheme();
  const { t } = useTranslation();
  const theme = useAppSelector((st) => st.theme.backgroundTheme);

  return (
    <Screen variant="image" imageUri={theme?.imageUrl}>
      <View style={s.centre}>
        <Text variant="quote" align="center">
          {t("onboarding.welcome.title")}
        </Text>
      </View>

      <View
        style={s.swipe}
        accessibilityRole="button"
        accessibilityLabel={t("onboarding.welcome.swipe")}
        onTouchEnd={onEnter}
      >
        <Ionicons name="chevron-up" size={28} color={t2.image.text} />
        <Text variant="body">{t("onboarding.welcome.swipe")}</Text>
      </View>
    </Screen>
  );
}
