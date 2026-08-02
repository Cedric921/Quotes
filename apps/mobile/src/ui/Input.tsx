import React from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { makeStyles, useTheme } from "../theme";
import { Text } from "./Text";

const useStyles = makeStyles((t) => ({
  field: {
    minHeight: 60,
    paddingHorizontal: t.space.lg,
    borderRadius: t.radius.pill,
    backgroundColor: t.base.bgElevated,
    color: t.base.textPrimary,
    fontSize: t.typography.body.size,
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
}

/** Single-line pill field. Used for the name step and the settings sub-pages. */
export function Input({ label, ...rest }: InputProps) {
  const s = useStyles();
  const t = useTheme();
  return (
    <TextInput
      accessibilityLabel={label ?? rest.placeholder}
      placeholderTextColor={t.base.textTertiary}
      style={s.field}
      {...rest}
    />
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
