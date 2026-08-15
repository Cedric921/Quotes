import React from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { makeStyles, useTheme } from "../theme";
import { MetalFill } from "./MetalFill";
import { Text } from "./Text";

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 64,
    paddingLeft: t.space.lg,
    paddingRight: t.space.xs,
    borderRadius: t.radius.pill,
    backgroundColor: t.base.bgElevated,
    ...t.shadow.row,
  },
  label: { flex: 1 },
  controls: { flexDirection: "row", alignItems: "center", gap: t.space.xs },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.base.surfaceRaised,
  },
  buttonDisabled: { opacity: 0.35 },
  value: { minWidth: 36, textAlign: "center" },
  valuePill: {
    paddingHorizontal: t.space.md,
    paddingVertical: t.space.xs,
    borderRadius: t.radius.pill,
    backgroundColor: t.base.surfaceRaised,
  },
}));

export interface StepperProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
}

/** `label   −  n  +` — used for "Combien" (reminders per day). */
export function Stepper({
  label,
  value,
  min = 1,
  max = 20,
  onChange,
}: StepperProps) {
  const s = useStyles();
  const t = useTheme();
  const { t: translate } = useTranslation();

  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next === value) return;
    void Haptics.selectionAsync();
    onChange(next);
  };

  return (
    <View style={s.row} accessibilityLabel={`${label}: ${value}`}>
      <MetalFill radius="pill" />
      <Text variant="body" style={s.label}>
        {label}
      </Text>
      <View style={s.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={translate("common.decrease")}
          onPress={() => step(-1)}
          disabled={value <= min}
          style={[s.button, value <= min ? s.buttonDisabled : null]}
        >
          <Ionicons name="remove" size={22} color={t.base.textPrimary} />
        </Pressable>

        <Text variant="body" style={s.value} weight="600">
          {value}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={translate("common.increase")}
          onPress={() => step(1)}
          disabled={value >= max}
          style={[s.button, value >= max ? s.buttonDisabled : null]}
        >
          <Ionicons name="add" size={22} color={t.base.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

export interface TimeRowProps {
  label: string;
  /** Already formatted for the active locale. */
  value: string;
  onPress: () => void;
}

/** `label ........ [ 22:00 ]` — opens the native wheel picker. */
export function TimeRow({ label, value, onPress }: TimeRowProps) {
  const s = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      onPress={onPress}
      style={s.row}
    >
      <MetalFill radius="pill" />
      <Text variant="body" style={s.label}>
        {label}
      </Text>
      <View style={s.valuePill}>
        <Text variant="body" weight="600">
          {value}
        </Text>
      </View>
    </Pressable>
  );
}
