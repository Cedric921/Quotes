import React, { type PropsWithChildren } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { makeStyles, useTheme } from "../theme";
import { Text } from "./Text";

const useStyles = makeStyles((t) => ({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.space.xs,
    minHeight: 56,
    paddingHorizontal: t.space.lg,
    borderRadius: t.radius.pill,
    borderWidth: t.border.hairline,
    borderColor: t.base.borderSubtle,
    backgroundColor: "transparent",
  },
  chipSelected: {
    backgroundColor: t.base.surfaceRaised,
    borderWidth: t.border.selected,
    borderColor: t.base.borderStrong,
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: t.space.sm,
  },
}));

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
}

/**
 * Auto-width pill used for the topic picker. The affordance is the prefix:
 * `+` invites you to add, `✓` confirms it's in.
 */
export function Chip({ label, selected, onPress, testID }: ChipProps) {
  const s = useStyles();
  const t = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!selected }}
      accessibilityLabel={label}
      testID={testID}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress?.();
      }}
      style={[s.chip, selected ? s.chipSelected : null]}
    >
      <Ionicons
        name={selected ? "checkmark" : "add"}
        size={20}
        color={selected ? t.base.textPrimary : t.base.textSecondary}
      />
      <Text variant="body" tone={selected ? "primary" : "dim"}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Flow layout: chips size to their label and wrap, two or three per line. */
export function ChipWrap({ children }: PropsWithChildren) {
  const s = useStyles();
  return <View style={s.wrap}>{children}</View>;
}
