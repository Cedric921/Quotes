import React, { type PropsWithChildren } from "react";
import { View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { makeStyles, useTheme } from "../theme";
import { MetalFill } from "./MetalFill";

const useStyles = makeStyles((t) => ({
  card: {
    borderRadius: t.radius.xl,
    backgroundColor: t.base.bgElevated,
    padding: t.space.lg,
    ...t.shadow.card,
  },
  overlay: {
    borderRadius: t.radius.lg,
    backgroundColor: t.base.surfaceOverlay,
    padding: t.space.md,
  },
  gradientBorder: {
    borderRadius: t.radius.xl + t.border.selected,
    padding: t.border.selected,
    ...t.shadow.card,
  },
  gradientInner: {
    borderRadius: t.radius.xl,
    backgroundColor: t.base.bgElevated,
    padding: t.space.lg,
  },
  filled: {
    borderRadius: t.radius.xl,
    padding: t.space.lg,
    ...t.shadow.card,
  },
}));

export interface CardProps extends PropsWithChildren {
  /** `overlay` is the opaque variant used on top of a photo (streak toast). */
  variant?: "default" | "overlay";
  style?: ViewStyle;
}

export function Card({ variant = "default", style, children }: CardProps) {
  const s = useStyles();
  return (
    <View style={[variant === "overlay" ? s.overlay : s.card, style]}>
      {variant === "overlay" ? null : <MetalFill radius="xl" />}
      {children}
    </View>
  );
}

/**
 * Card with a 1.5px gradient outline. Marks anything premium or
 * "we made this for you": the personalised plan, the trial breakdown,
 * the widget preview.
 */
export function GradientBorderCard({
  children,
  style,
}: PropsWithChildren<{ style?: ViewStyle }>) {
  const s = useStyles();
  const t = useTheme();
  return (
    <LinearGradient
      colors={[...t.gradient.colors]}
      start={t.gradient.diagonal.start}
      end={t.gradient.diagonal.end}
      style={[s.gradientBorder, style]}
    >
      <View style={s.gradientInner}>
        <MetalFill radius="xl" />
        {children}
      </View>
    </LinearGradient>
  );
}

/**
 * Card whose *fill* is the gradient. Exactly one place uses this:
 * the "Tout débloquer" banner at the top of the profile sheet.
 */
export function GradientCard({
  children,
  style,
}: PropsWithChildren<{ style?: ViewStyle }>) {
  const s = useStyles();
  const t = useTheme();
  return (
    <LinearGradient
      colors={[...t.gradient.colors]}
      start={t.gradient.horizontal.start}
      end={t.gradient.horizontal.end}
      style={[s.filled, style]}
    >
      {children}
    </LinearGradient>
  );
}
