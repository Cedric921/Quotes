import React from "react";
import { Pressable, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "../theme";

const useStyles = makeStyles((t) => ({
  wrap: {
    borderRadius: t.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  onImage: {
    // The blur has to be clipped to the disc; the base variant must not
    // be, or iOS clips its shadow with it and the button disappears into
    // the metal.
    overflow: "hidden",
    borderWidth: t.border.hairline,
    borderColor: t.image.chromeBorder,
    backgroundColor: t.image.chrome,
  },
  onBase: {
    backgroundColor: t.base.bgElevated,
    borderWidth: t.border.hairline,
    borderColor: t.base.glassBorder,
    ...t.shadow.button,
  },
  blur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pressed: { opacity: 0.6 },
}));

export interface IconCircleProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  label: string;
  testID?: string;
}

/**
 * Round chrome button. Renders translucent + blurred over a photo, and as a
 * solid elevated circle on a base surface — the surface decides, not the caller.
 */
export function IconCircle({
  icon,
  onPress,
  size = 52,
  label,
  testID,
}: IconCircleProps) {
  const s = useStyles();
  const t = useTheme();
  const onImage = t.surface === "image";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        s.wrap,
        { width: size, height: size },
        onImage ? s.onImage : s.onBase,
        pressed ? s.pressed : null,
      ]}
    >
      {onImage ? (
        <BlurView intensity={t.image.blurIntensity} tint="dark" style={s.blur} />
      ) : null}
      <View>
        <Ionicons name={icon} size={size * 0.44} color={t.fg} />
      </View>
    </Pressable>
  );
}
