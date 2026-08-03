import React from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { makeStyles, useTheme } from "../../../theme";
import { Card, Text } from "../../../ui";
import { StreakWeek } from "../../streak/StreakWeek";

const useStyles = makeStyles((t) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: t.space.sm,
  },
  title: { flex: 1 },
  actions: { flexDirection: "row", gap: t.space.md },
  action: { minWidth: 32, minHeight: 32, alignItems: "center", justifyContent: "center" },
}));

export interface StreakCardProps {
  count: number;
  labels: string[];
  completed: number[];
  onShare: () => void;
  onOptions: () => void;
}

export function StreakCard({
  count,
  labels,
  completed,
  onShare,
  onOptions,
}: StreakCardProps) {
  const s = useStyles();
  const t2 = useTheme();
  const { t } = useTranslation();

  return (
    <Card>
      <View style={s.header}>
        <Text variant="title" style={s.title}>
          {t("profile.streak.title")}
        </Text>
        <View style={s.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("profile.streak.share")}
            onPress={onShare}
            style={s.action}
          >
            <Ionicons
              name="share-outline"
              size={22}
              color={t2.base.textPrimary}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("profile.streak.options")}
            onPress={onOptions}
            style={s.action}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={t2.base.textPrimary}
            />
          </Pressable>
        </View>
      </View>

      <StreakWeek count={count} labels={labels} completed={completed} />
    </Card>
  );
}
