import React from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button, GradientBorderCard, Sheet, Text } from "../../../ui";
import { makeStyles } from "../../../theme";
import { homeScreenService } from "../../../services/homeScreenService";

const useStyles = makeStyles((t) => ({
  intro: { marginBottom: t.space.lg },
  steps: { gap: t.space.md, marginBottom: t.space.xl },
  step: { flexDirection: "row", gap: t.space.sm },
  index: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: t.base.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBody: { flex: 1 },
  preview: { alignItems: "center", marginBottom: t.space.xl },
  widget: {
    minHeight: 110,
    minWidth: 220,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.palette.ink900,
    borderRadius: t.radius.lg,
    padding: t.space.md,
  },
}));

export interface WidgetsHelpScreenProps {
  /** Home-screen and lock-screen widgets are installed differently. */
  surface: "home" | "lock";
  onBack: () => void;
}

const STEPS = { home: 3, lock: 4 } as const;

/**
 * Instructions, not a setting.
 *
 * There is no API to add a widget for the user — both platforms require them
 * to do it by hand — so the honest thing is to show exactly where to tap and
 * get out of the way. The button opens the home screen; it can't do more.
 */
export function WidgetsHelpScreen({ surface, onBack }: WidgetsHelpScreenProps) {
  const s = useStyles();
  const { t } = useTranslation();
  const count = STEPS[surface];

  return (
    <Sheet title={t(`widgets.${surface}.title`)} onBack={onBack} collapsedOnly>
      <Text variant="body" tone="dim" style={s.intro}>
        {t(`widgets.${surface}.intro`)}
      </Text>

      <View style={s.preview}>
        <GradientBorderCard>
          <View style={s.widget}>
            <Text variant="body" align="center">
              {t("onboarding.widget.sample")}
            </Text>
          </View>
        </GradientBorderCard>
      </View>

      <View style={s.steps}>
        {Array.from({ length: count }, (_, i) => (
          <View key={i} style={s.step}>
            <View style={s.index}>
              <Text variant="caption" weight="700">
                {i + 1}
              </Text>
            </View>
            <View style={s.stepBody}>
              <Text variant="body">
                {t(`widgets.${surface}.step${i + 1}`)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Button
        label={t("widgets.openHome")}
        onPress={() => void homeScreenService.openHomeScreen()}
      />
    </Sheet>
  );
}
