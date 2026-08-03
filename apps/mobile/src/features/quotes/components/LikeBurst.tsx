import React, { useEffect } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { makeStyles, useTheme } from "../../../theme";

const useStyles = makeStyles(() => ({
  layer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
}));

export interface LikeBurstProps {
  /** Flipped to true on like; the component calls `onDone` when it finishes. */
  playing: boolean;
  onDone: () => void;
}

/**
 * The oversized heart that flashes over the quote on a like.
 *
 * Overshoot then settle, then fade — the settle is what makes it read as a
 * confirmation rather than as a pop-up. Runs on the UI thread via Reanimated,
 * which v1 had installed but never used.
 */
export function LikeBurst({ playing, onDone }: LikeBurstProps) {
  const s = useStyles();
  const t = useTheme();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!playing) return;

    scale.value = 0;
    opacity.value = 1;
    scale.value = withSequence(
      withTiming(1.15, { duration: t.motion.burstIn }),
      withTiming(1, { duration: t.motion.fast }),
    );
    opacity.value = withSequence(
      withTiming(1, { duration: t.motion.burstIn }),
      withTiming(0, { duration: t.motion.burstOut }, (finished) => {
        if (finished) runOnJS(onDone)();
      }),
    );
  }, [playing, scale, opacity, onDone, t.motion]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!playing) return null;

  return (
    <View style={s.layer} pointerEvents="none">
      <Animated.View style={style}>
        <Ionicons name="heart" size={180} color={t.image.text} />
      </Animated.View>
    </View>
  );
}
