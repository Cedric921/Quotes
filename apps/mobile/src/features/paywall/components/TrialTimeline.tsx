import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "../../../theme";
import { Text } from "../../../ui";

const RAIL_W = 28;

const useStyles = makeStyles((t) => ({
  root: { flexDirection: "row", gap: t.space.md },
  railWrap: { width: RAIL_W, alignItems: "center" },
  rail: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: RAIL_W,
    borderRadius: RAIL_W / 2,
  },
  icons: { gap: t.space.xxl, paddingVertical: t.space.xs },
  icon: { height: 24, justifyContent: "center", alignItems: "center" },
  steps: { flex: 1, gap: t.space.lg },
  step: { gap: t.space.xxs },
  struck: { textDecorationLine: "line-through" },
}));

export interface TrialStep {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  /** The already-completed first step is struck through. */
  done?: boolean;
}

/**
 * The four beats of the free trial, on a gradient rail.
 *
 * Spelling out the reminder date and the charge date is what makes this
 * screen convert without feeling like a trap — the rail is there to make the
 * sequence read as inevitable and short, not to hide the last step.
 */
export function TrialTimeline({ steps }: { steps: TrialStep[] }) {
  const s = useStyles();
  const t = useTheme();

  return (
    <View style={s.root}>
      <View style={s.railWrap}>
        <LinearGradient
          colors={[...t.gradient.colors]}
          start={t.gradient.vertical.start}
          end={t.gradient.vertical.end}
          style={s.rail}
        />
        <View style={s.icons}>
          {steps.map((step) => (
            <View key={step.title} style={s.icon}>
              <Ionicons name={step.icon} size={18} color={t.palette.white} />
            </View>
          ))}
        </View>
      </View>

      <View style={s.steps}>
        {steps.map((step) => (
          <View key={step.title} style={s.step}>
            <Text
              variant="body"
              weight="700"
              style={step.done ? s.struck : undefined}
            >
              {step.title}
            </Text>
            <Text variant="body" tone="dim">
              {step.subtitle}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
