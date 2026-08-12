import React, { useEffect } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { makeStyles, useTheme } from "../theme";

/** One breath in, one out. Slow enough to be felt, not watched. */
const BREATH_MS = 2600;

const useStyles = makeStyles((t) => ({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  glow: {
    position: "absolute",
    borderRadius: t.radius.pill,
    // The reference lights each object from behind; two stacked circles get
    // the same falloff without a blur pass on every tile.
    opacity: 0.18,
  },
  core: {
    position: "absolute",
    borderRadius: t.radius.pill,
    opacity: 0.45,
  },
}));

export interface TileArtProps {
  icon: keyof typeof Ionicons.glyphMap;
  /** Overall footprint; the glow and the glyph scale from it. */
  size?: number;
}

/**
 * What a feature tile shows until its illustration exists.
 *
 * The design's tiles and funnel screens carry bespoke 3D drawings, animated,
 * and none of them are in this repo — they rendered as a title over empty
 * space. This is the same composition made from what the app already ships:
 * the accent gradient as a glow, the subject's own icon on top, and the same
 * slow breathing the reference art has, so the tiles are alive rather than
 * placeholders. Every caller prefers a real illustration the moment one is
 * passed.
 *
 * The motion runs on the UI thread and stops for anyone who asked the system
 * to reduce it.
 */
export function TileArt({ icon, size = 120 }: TileArtProps) {
  const s = useStyles();
  const t = useTheme();
  const reduced = useReducedMotion();

  // 0 → 1 → 0, forever: the glow swells and the glyph lifts with it.
  const breath = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    breath.value = withRepeat(
      withTiming(1, { duration: BREATH_MS, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [breath, reduced]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breath.value * 0.08 }],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + breath.value * 0.25,
  }));

  const glyphStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -breath.value * size * 0.05 }],
  }));

  const glow = { width: size, height: size };
  const core = { width: size * 0.56, height: size * 0.56 };

  return (
    <View style={s.wrap}>
      <Animated.View style={[s.glow, glow, glowStyle]}>
        <LinearGradient
          colors={[...t.gradient.colors]}
          start={t.gradient.diagonal.start}
          end={t.gradient.diagonal.end}
          style={[glow, { borderRadius: t.radius.pill }]}
        />
      </Animated.View>
      <Animated.View style={[s.core, core, coreStyle]}>
        <LinearGradient
          colors={[...t.gradient.colors]}
          start={t.gradient.diagonal.start}
          end={t.gradient.diagonal.end}
          style={[core, { borderRadius: t.radius.pill }]}
        />
      </Animated.View>
      <Animated.View style={glyphStyle}>
        <Ionicons name={icon} size={size * 0.34} color={t.base.textPrimary} />
      </Animated.View>
    </View>
  );
}
