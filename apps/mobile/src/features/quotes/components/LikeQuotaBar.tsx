import React from "react";
import { View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "../../../theme";
import { Text } from "../../../ui";

const useStyles = makeStyles((t) => ({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.space.xs,
    height: 44,
    paddingHorizontal: t.space.md,
    borderRadius: t.radius.pill,
    overflow: "hidden",
    borderWidth: t.border.hairline,
    borderColor: t.image.chromeBorder,
    backgroundColor: t.image.chrome,
  },
  blur: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  track: {
    width: 120,
    height: 6,
    borderRadius: 3,
    backgroundColor: t.image.chromeBorder,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 3, backgroundColor: t.image.text },
}));

export interface LikeQuotaBarProps {
  used: number;
  total: number;
}

/**
 * Permanent header on the feed while the user is on the free tier.
 *
 * It is framed as progress toward a personalised feed, not as a limit being
 * spent — same number, and the difference decides whether liking feels like
 * a reward or a cost.
 */
export function LikeQuotaBar({ used, total }: LikeQuotaBarProps) {
  const s = useStyles();
  const t = useTheme();
  const ratio = Math.max(0, Math.min(1, total === 0 ? 0 : used / total));

  return (
    <View
      style={s.pill}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: used }}
    >
      <BlurView intensity={t.image.blurIntensity} tint="dark" style={s.blur} />
      <Ionicons name="heart-outline" size={20} color={t.image.text} />
      <Text variant="label">{`${used}/${total}`}</Text>
      <View style={s.track}>
        <View style={[s.fill, { width: `${ratio * 100}%` }]} />
      </View>
    </View>
  );
}
