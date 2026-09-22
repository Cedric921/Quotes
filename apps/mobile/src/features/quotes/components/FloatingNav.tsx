import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { makeStyles, useTheme } from "../../../theme";
import { IconCircle } from "../../../ui";

const useStyles = makeStyles((t) => ({
  bar: {
    position: "absolute",
    left: t.gutter,
    right: t.gutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  right: { flexDirection: "row", gap: t.space.sm },
}));

export interface FloatingNavProps {
  onTopics: () => void;
  onTheme: () => void;
  onProfile: () => void;
}

/**
 * Three round buttons floating over the photo — there is no tab bar.
 *
 * A bar would put an opaque strip across the bottom third of every quote,
 * which is exactly where the image usually resolves. Splitting the buttons
 * left and right keeps the centre column clear for the text.
 */
export function FloatingNav({ onTopics, onTheme, onProfile }: FloatingNavProps) {
  const s = useStyles();
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[s.bar, { bottom: Math.max(insets.bottom, t.space.md) }]}
      pointerEvents="box-none"
    >
      <IconCircle icon="grid-outline" label="Sujets" onPress={onTopics} />
      <View style={s.right}>
        <IconCircle icon="color-fill-outline" label="Thème" onPress={onTheme} />
        <IconCircle icon="person-outline" label="Profil" onPress={onProfile} />
      </View>
    </View>
  );
}
