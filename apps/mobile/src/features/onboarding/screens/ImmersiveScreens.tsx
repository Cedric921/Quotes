import React from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Button, Screen, Text } from "../../../ui";
import { makeStyles, useTheme } from "../../../theme";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { next } from "../store/onboardingSlice";

const useStyles = makeStyles(() => ({
  centre: { flex: 1, alignItems: "center", justifyContent: "center" },
  swipe: { alignItems: "center", paddingBottom: 24 },
  // The gesture's target: it must be a real native view that fills the
  // screen, or the pan has nothing to attach to.
  surface: { flex: 1 },
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

/** How far up the finger has to travel before the feed takes over. */
const SWIPE_DISTANCE = 60;

/**
 * Hand-off to the feed. No button — the gesture it teaches is the gesture the
 * feed runs on, so the screen is dismissed by performing it.
 *
 * It really is the gesture: the screen used to accept a tap on the hint and
 * call it a swipe, which taught nothing. A tap still works, because the hint
 * looks tappable and a screen reader can only tap.
 */
export function WelcomeScreen({ onEnter }: { onEnter: () => void }) {
  const s = useStyles();
  const t2 = useTheme();
  const { t } = useTranslation();
  const theme = useAppSelector((st) => st.theme.backgroundTheme);

  // `runOnJS` is not optional here: with Reanimated installed, a gesture
  // callback is a worklet, and calling a plain JS function from the UI thread
  // crashes the app rather than entering the feed.
  const swipeUp = Gesture.Pan()
    .runOnJS(true)
    .onEnd((event) => {
      if (event.translationY < -SWIPE_DISTANCE) onEnter();
    });

  // The detector sits *inside* `Screen`, on a view React Native is told not
  // to flatten. Wrapped around `Screen` — a composite — it warned that its
  // child "may get view-flattened" and the swipe never fired: the welcome
  // screen could only be left by tapping the hint.
  return (
    <Screen variant="image" imageUri={theme?.imageUrl}>
      <GestureDetector gesture={swipeUp}>
        <View style={s.surface} collapsable={false}>
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
        </View>
      </GestureDetector>
    </Screen>
  );
}
