import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "../../../theme";
import { Text } from "../../../ui";

const RAIL_W = 28;

const useStyles = makeStyles((t) => ({
  root: { flexDirection: "row", gap: t.space.md },
  railWrap: { width: RAIL_W },
  rail: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: RAIL_W,
    borderRadius: RAIL_W / 2,
  },
  steps: { flex: 1, gap: t.space.lg },
  /**
   * One row per step: the icon and its text are siblings, so they share a
   * top edge by construction. Two parallel columns with their own gaps —
   * which is what this was — drift apart the moment a title wraps.
   */
  step: { flexDirection: "row", gap: t.space.md, alignItems: "flex-start" },
  icon: {
    width: RAIL_W,
    marginLeft: -(RAIL_W + t.space.md),
    // Centred on the title's first line, whatever the subtitle does below.
    height: t.typography.body.lineHeight,
    justifyContent: "center",
    alignItems: "center",
  },
  text: { flex: 1, gap: t.space.xxs },
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
      </View>

      <View style={s.steps}>
        {steps.map((step) => (
          <View key={step.title} style={s.step}>
            <View style={s.icon}>
              <Ionicons name={step.icon} size={18} color={t.palette.white} />
            </View>
            <View style={s.text}>
              <Text
                variant="body"
                weight="700"
                style={step.done ? s.struck : undefined}
              >
                {step.title}
              </Text>
              <Text variant="caption" tone="dim">
                {step.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
