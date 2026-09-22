import React, { useState } from "react";
import {
  Pressable,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "../theme";
import { Text } from "./Text";

const useStyles = makeStyles((t) => ({
  // The pill is the container, not the input: it has to hold the eye toggle
  // and still read as one field.
  pill: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 60,
    paddingHorizontal: t.space.lg,
    borderRadius: t.radius.pill,
    backgroundColor: t.base.bgElevated,
  },
  // On a blurred pane the pill is the pane: no fill of its own.
  pillGlass: { backgroundColor: "transparent" },
  field: {
    flex: 1,
    paddingVertical: t.space.sm,
    color: t.base.textPrimary,
    fontSize: t.typography.body.size,
  },
  leading: { marginRight: t.space.sm },
  reveal: {
    marginLeft: t.space.xs,
    height: t.hitSize,
    width: t.hitSize,
    alignItems: "center",
    justifyContent: "center",
  },
  area: {
    minHeight: 180,
    paddingTop: t.space.md,
    paddingBottom: t.space.md,
    paddingHorizontal: t.space.md,
    borderRadius: t.radius.xl,
    backgroundColor: t.base.bgElevated,
    color: t.base.textPrimary,
    fontSize: t.typography.body.size,
    lineHeight: t.typography.body.lineHeight,
    textAlignVertical: "top",
  },
  counter: {
    alignSelf: "flex-end",
    marginTop: t.space.xs,
  },
}));

export interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  /**
   * Password field: masks the value and adds the reveal toggle inside the
   * pill. Use this rather than `secureTextEntry`, so every password field in
   * the app gets the same affordance.
   */
  secure?: boolean;
  /** Reveal-toggle accessibility label, e.g. "Afficher le mot de passe". */
  revealLabel?: string;
  /** `glass` sits on a blurred surface — the sheet footer — and draws no fill. */
  variant?: "solid" | "glass";
  /** Leading icon, e.g. the magnifier on a search field. */
  icon?: keyof typeof Ionicons.glyphMap;
}

/**
 * Single-line pill field. Used for the name step, the settings sub-pages and
 * every auth form.
 */
export function Input({
  label,
  secure,
  revealLabel,
  variant = "solid",
  icon,
  ...rest
}: InputProps) {
  const s = useStyles();
  const t = useTheme();
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={[s.pill, variant === "glass" ? s.pillGlass : null]}>
      {icon ? (
        <Ionicons
          name={icon}
          size={20}
          color={t.base.textTertiary}
          style={s.leading}
        />
      ) : null}
      <TextInput
        accessibilityLabel={label ?? rest.placeholder}
        placeholderTextColor={t.base.textTertiary}
        secureTextEntry={secure && !revealed}
        style={s.field}
        {...rest}
      />
      {secure ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={revealLabel ?? label ?? rest.placeholder}
          accessibilityState={{ selected: revealed }}
          hitSlop={8}
          onPress={() => setRevealed((prev) => !prev)}
          style={s.reveal}
        >
          <Ionicons
            name={revealed ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={t.base.textTertiary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

export interface TextAreaProps extends Omit<TextInputProps, "style"> {
  maxLength: number;
  value: string;
  label?: string;
}

/**
 * Multi-line field with the character counter under its right edge.
 * The counter is part of the field, not of the screen — it moves with it.
 */
export function TextArea({ maxLength, value, label, ...rest }: TextAreaProps) {
  const s = useStyles();
  const t = useTheme();
  return (
    <View>
      <TextInput
        accessibilityLabel={label ?? rest.placeholder}
        multiline
        maxLength={maxLength}
        value={value}
        placeholderTextColor={t.base.textTertiary}
        style={s.area}
        {...rest}
      />
      <Text variant="caption" tone="tertiary" style={s.counter}>
        {`${value.length}/${maxLength}`}
      </Text>
    </View>
  );
}
