import React from "react";
import {
  Text as RNText,
  type TextProps as RNTextProps,
  type TextStyle,
} from "react-native";
import { useTheme, type TypographyVariant } from "../theme";

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  /** `primary` follows the surface; `dim` is the muted tone of that surface. */
  tone?: "primary" | "dim" | "tertiary" | "danger" | "onCta";
  align?: TextStyle["textAlign"];
  weight?: TextStyle["fontWeight"];
}

/**
 * Every string in the app goes through here.
 *
 * The `quote` variant is the only one that switches to serif, and it picks up
 * the font family the API serves for the active background theme.
 */
export function Text({
  variant = "body",
  tone = "primary",
  align,
  weight,
  style,
  ...rest
}: TextProps) {
  const t = useTheme();
  const spec = t.typography[variant];

  const color =
    tone === "dim"
      ? t.fgDim
      : tone === "tertiary"
        ? t.surface === "image"
          ? t.image.textDim
          : t.base.textTertiary
        : tone === "danger"
          ? t.base.danger
          : tone === "onCta"
            ? t.base.ctaFg
            : t.fg;

  return (
    <RNText
      style={[
        {
          color,
          fontSize: spec.size,
          lineHeight: spec.lineHeight,
          fontWeight: (weight ?? spec.weight) as TextStyle["fontWeight"],
          textAlign: align,
        },
        variant === "quote" && t.quoteFontFamily
          ? { fontFamily: t.quoteFontFamily }
          : null,
        style,
      ]}
      {...rest}
    />
  );
}
