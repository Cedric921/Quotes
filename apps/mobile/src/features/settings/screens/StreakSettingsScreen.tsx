import React from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { makeStyles } from "../../../theme";
import { Card, Sheet, Text, Toggle } from "../../../ui";
import { useStreak } from "../../streak/useStreak";

const useStyles = makeStyles((t) => ({
  intro: { marginBottom: t.space.lg },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: t.space.sm,
    paddingHorizontal: t.space.lg,
  },
}));

/**
 * A whole screen for one switch — and it earns it.
 *
 * Turning the streak off is the escape hatch for a feature designed to create
 * obligation. Burying it inside a list would be the wrong call; it gets its
 * own page, with the reason to keep it stated honestly above the switch.
 */
export function StreakSettingsScreen({ onBack }: { onBack: () => void }) {
  const s = useStyles();
  const { t } = useTranslation();
  const { tracking, setTrackingEnabled } = useStreak();

  return (
    <Sheet title={t("streak.settings.title")} onBack={onBack} collapsedOnly>
      <Text variant="body" style={s.intro}>
        {t("streak.settings.intro")}
      </Text>

      <Card style={s.row}>
        <View>
          <Text variant="body">{t("streak.settings.track")}</Text>
        </View>
        <Toggle
          value={tracking}
          onChange={setTrackingEnabled}
          label={t("streak.settings.track")}
        />
      </Card>
    </Sheet>
  );
}
