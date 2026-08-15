import React, { Fragment, type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "../theme";
import { MetalFill } from "./MetalFill";
import { Text } from "./Text";

const useStyles = makeStyles((t) => ({
  section: { marginBottom: t.space.xl },
  sectionLabel: {
    marginBottom: t.space.xs,
    marginLeft: t.space.xs,
    letterSpacing: 0.6,
  },
  group: {
    borderRadius: t.radius.lg,
    backgroundColor: t.base.bgElevated,
    ...t.shadow.card,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.space.md,
    minHeight: 60,
    paddingHorizontal: t.space.md,
  },
  rowPressed: { backgroundColor: t.base.surfaceRaised },
  label: { flex: 1 },
  // Indented so it starts under the label, never under the icon.
  separator: {
    height: t.border.hairline,
    marginLeft: 56,
    backgroundColor: t.base.surfaceRaised,
  },
}));

export interface SettingsRowProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  /** Replaces the chevron — a toggle, a value, a badge. */
  accessory?: ReactNode;
  value?: string;
  destructive?: boolean;
}

export function SettingsRow({
  label,
  icon,
  onPress,
  accessory,
  value,
  destructive,
}: SettingsRowProps) {
  const s = useStyles();
  const t = useTheme();

  const body = (
    <>
      {icon ? (
        <Ionicons
          name={icon}
          size={24}
          color={destructive ? t.base.danger : t.base.textSecondary}
        />
      ) : null}
      <Text
        variant="body"
        tone={destructive ? "danger" : "primary"}
        style={s.label}
      >
        {label}
      </Text>
      {value ? (
        <Text variant="body" tone="tertiary">
          {value}
        </Text>
      ) : null}
      {accessory ??
        (onPress ? (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={t.base.textTertiary}
          />
        ) : null)}
    </>
  );

  if (!onPress) return <View style={s.row}>{body}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [s.row, pressed ? s.rowPressed : null]}
    >
      {body}
    </Pressable>
  );
}

export interface SettingsSectionProps {
  /** Rendered in caps above the group. Omit for an unlabelled group. */
  title?: string;
  children: ReactNode;
}

/**
 * A titled group of rows with hairline separators between them.
 * The separator is indented to the label, which is what makes a long list
 * scan as columns rather than as a grid.
 */
export function SettingsSection({ title, children }: SettingsSectionProps) {
  const s = useStyles();
  const rows = React.Children.toArray(children).filter(Boolean);

  return (
    <View style={s.section}>
      {title ? (
        <Text variant="caption" tone="tertiary" style={s.sectionLabel}>
          {title.toUpperCase()}
        </Text>
      ) : null}
      <View style={s.group}>
        <MetalFill radius="lg" />
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 ? <View style={s.separator} /> : null}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}
