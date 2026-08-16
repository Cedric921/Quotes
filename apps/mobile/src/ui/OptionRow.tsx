import React from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { makeStyles, useOnImage, useTheme } from "../theme";
import { MetalFill } from "./MetalFill";
import { Text } from "./Text";

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.space.sm,
    minHeight: 68,
    paddingVertical: t.space.sm,
    paddingHorizontal: t.space.lg,
    borderRadius: t.radius.pill,
    borderWidth: t.border.hairline,
    borderColor: t.base.borderSubtle,
    // Transparent at rest, so the row works on a photo as well as a solid bg.
    backgroundColor: "transparent",
  },
  /** On the metal, a row is a lit strip of it, lifted like a card. */
  rowRaised: {
    backgroundColor: t.base.bgElevated,
    ...t.shadow.row,
  },
  rowSelected: {
    borderWidth: t.border.selected,
    borderColor: t.base.borderStrong,
  },
  /** Out of reach on this plan: dimmed, and the marker becomes a padlock. */
  rowLocked: { opacity: 0.55 },
  label: { flex: 1 },
  // Sized to the icon it stands in for, so a list mixing the two still lines up.
  glyph: { width: 24, textAlign: "center" },
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: t.border.selected,
    borderColor: t.base.textSecondary,
  },
  markerSelected: {
    backgroundColor: t.base.borderStrong,
    borderColor: t.base.borderStrong,
  },
}));

export interface OptionRowProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** `check` for multi-select, `radio` for single-select. */
  kind?: "check" | "radio";
  icon?: keyof typeof Ionicons.glyphMap;
  /** Drawn in the icon's place for symbols no icon font has. */
  glyph?: string;
  /**
   * The option exists but this account cannot pick it — a premium topic on
   * the free plan. The row stays in the list so the user sees what the plan
   * holds back, with a padlock where the checkbox would be, and does nothing
   * when pressed.
   */
  locked?: boolean;
  testID?: string;
}

/**
 * The workhorse of the onboarding questionnaire — 22 of the 30 steps are a
 * stack of these.
 *
 * On the base surface the row is a strip of brushed metal with a shadow, like
 * every raised surface there; over a photo it has no fill, only a hairline
 * outline, so the same component serves both without a second variant.
 */
export function OptionRow({
  label,
  selected,
  onPress,
  kind = "check",
  icon,
  glyph,
  locked,
  testID,
}: OptionRowProps) {
  const s = useStyles();
  const t = useTheme();
  const onImage = useOnImage();

  const handlePress = () => {
    void Haptics.selectionAsync();
    onPress?.();
  };

  return (
    <Pressable
      accessibilityRole={kind === "radio" ? "radio" : "checkbox"}
      accessibilityState={{ checked: !!selected && !locked, disabled: !!locked }}
      accessibilityLabel={label}
      testID={testID}
      disabled={locked}
      onPress={handlePress}
      style={[
        s.row,
        onImage ? null : s.rowRaised,
        selected && !locked ? s.rowSelected : null,
        locked ? s.rowLocked : null,
      ]}
    >
      {onImage ? null : <MetalFill radius="pill" />}
      {icon ? (
        <Ionicons
          name={icon}
          size={24}
          color={selected ? t.base.textPrimary : t.base.textSecondary}
        />
      ) : glyph ? (
        <Text
          variant="title"
          tone={selected ? "primary" : "dim"}
          style={s.glyph}
        >
          {glyph}
        </Text>
      ) : null}

      <Text
        variant="body"
        tone={selected ? "primary" : "dim"}
        style={s.label}
      >
        {label}
      </Text>

      {locked ? (
        <Ionicons
          name="lock-closed"
          size={22}
          color={t.base.textSecondary}
          accessibilityElementsHidden
        />
      ) : (
        <View style={[s.marker, selected ? s.markerSelected : null]}>
          {selected ? (
            <Ionicons name="checkmark" size={18} color={t.base.badgeFg} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
