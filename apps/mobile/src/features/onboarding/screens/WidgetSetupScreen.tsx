import React from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button, GradientBorderCard, LinkButton, Screen, Text } from "../../../ui";
import { SurfaceProvider, makeStyles } from "../../../theme";
import { useAppDispatch } from "../../../store/hooks";
import { next } from "../store/onboardingSlice";
import { homeScreenService } from "../../../services/homeScreenService";

const useStyles = makeStyles((t) => ({
  title: { marginTop: t.space.xl },
  subtitle: { marginTop: t.space.sm, marginBottom: t.space.xl },
  phone: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  frame: {
    width: "86%",
    aspectRatio: 0.62,
    borderRadius: t.radius.xl + 12,
    borderWidth: 2,
    borderColor: t.base.surfaceRaised,
    paddingHorizontal: t.space.md,
    paddingTop: t.space.xxl,
    overflow: "hidden",
  },
  notch: {
    alignSelf: "center",
    width: 96,
    height: 26,
    borderRadius: t.radius.pill,
    backgroundColor: t.base.surfaceRaised,
    marginBottom: t.space.lg,
  },
  widgetInner: {
    minHeight: 110,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.palette.ink900,
    borderRadius: t.radius.lg,
    padding: t.space.md,
  },
  appGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: t.space.sm,
    marginTop: t.space.lg,
  },
  appDot: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: t.radius.md,
    backgroundColor: t.base.bgElevated,
  },
}));

/**
 * Teaches the home-screen widget with a mock of the user's own phone.
 * Opening the system home screen ends the app session, so this is deliberately
 * the last step before the feed — and "Me rappeler plus tard" is a real
 * option, not a dark-pattern decline.
 */
export function WidgetSetupScreen() {
  const s = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return (
    <Screen
      footer={
        <View style={{ gap: 4 }}>
          <Button
            label={t("onboarding.widget.install")}
            onPress={() => {
              void homeScreenService.openHomeScreen();
              dispatch(next());
            }}
          />
          <LinkButton
            label={t("onboarding.widget.later")}
            onPress={() => dispatch(next())}
          />
        </View>
      }
    >
      <Text variant="display" align="center" style={s.title}>
        {t("onboarding.widget.title")}
      </Text>
      <Text variant="body" tone="dim" align="center" style={s.subtitle}>
        {t("onboarding.widget.subtitle")}
      </Text>

      <View style={s.phone}>
        <View style={s.frame}>
          <View style={s.notch} />
          <GradientBorderCard>
            {/* The mock-up is the real widget: ink, white text. */}
            <SurfaceProvider surface="image">
              <View style={s.widgetInner}>
                <Text variant="body" align="center">
                  {t("onboarding.widget.sample")}
                </Text>
              </View>
            </SurfaceProvider>
          </GradientBorderCard>
          <View style={s.appGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <View key={i} style={s.appDot} />
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}
