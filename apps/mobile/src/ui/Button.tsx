import React from "react";
import { ActivityIndicator, Pressable, View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "../theme";
import { Text } from "./Text";

const fill = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

const useStyles = makeStyles((t) => ({
  base: {
    height: 60,
    borderRadius: t.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  solid: { backgroundColor: t.base.ctaBg },
  disabled: { backgroundColor: t.base.ctaDisabledBg },
  gradientFill: {
    ...fill,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.85 },
  link: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: t.space.xs,
    minHeight: t.hitSize,
    paddingHorizontal: t.space.sm,
  },
}));

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  /** `primary` is the white pill. `gradient` is reserved for conversion moments. */
  variant?: "primary" | "gradient";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

/**
 * The full-width pill CTA that sits at the bottom of nearly every screen.
 *
 * Disabled is a flat grey fill with dark text — not a faded white — because
 * on this background a translucent white reads as "loading", not "blocked".
 */
export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
  testID,
}: ButtonProps) {
  const s = useStyles();
  const t = useTheme();
  const inert = disabled || loading;

  const handlePress = () => {
    if (inert) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!inert, busy: !!loading }}
      testID={testID}
      onPress={handlePress}
      disabled={inert}
      style={({ pressed }) => [
        s.base,
        variant === "primary" || inert ? (inert ? s.disabled : s.solid) : null,
        pressed && !inert ? s.pressed : null,
        style,
      ]}
    >
      {variant === "gradient" && !inert ? (
        <LinearGradient
          colors={[...t.gradient.colors]}
          start={t.gradient.horizontal.start}
          end={t.gradient.horizontal.end}
          style={s.gradientFill}
        />
      ) : null}
      {loading ? (
        <ActivityIndicator color={t.base.ctaFg} />
      ) : (
        <Text variant="label" tone="onCta" weight="700">
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export interface LinkButtonProps {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  align?: "center" | "start" | "end";
  testID?: string;
}

/** Secondary text action: "Ignorer", "Me rappeler plus tard", "Obtenez le lot". */
export function LinkButton({
  label,
  onPress,
  icon,
  align = "center",
  testID,
}: LinkButtonProps) {
  const s = useStyles();
  const t = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        s.link,
        {
          alignSelf:
            align === "start"
              ? "flex-start"
              : align === "end"
                ? "flex-end"
                : "center",
        },
        pressed ? s.pressed : null,
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={18} color={t.fgDim} />
      ) : null}
      <Text variant="body" tone="dim">
        {label}
      </Text>
    </Pressable>
  );
}
