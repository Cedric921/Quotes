import React, { useEffect } from "react";
import { Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { makeStyles, useTheme } from "../theme";

const TRACK_W = 60;
const TRACK_H = 34;
const KNOB = 28;

const fill = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

const useStyles = makeStyles((t) => ({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: t.radius.pill,
    backgroundColor: t.base.control,
    justifyContent: "center",
    overflow: "hidden",
  },
  gradient: { ...fill },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: t.palette.white,
    marginHorizontal: (TRACK_H - KNOB) / 2,
  },
}));

export interface ToggleProps {
  value: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
}

/**
 * The only control in the app whose *on* state uses the accent gradient —
 * it reads as "this is doing something for you", which is the point of every
 * toggle in this product (reminders, streak tracking, analytics).
 */
export function Toggle({ value, onChange, label, disabled }: ToggleProps) {
  const s = useStyles();
  const t = useTheme();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: t.motion.fast });
  }, [value, progress, t.motion.fast]);

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * (TRACK_W - KNOB - (TRACK_H - KNOB)) }],
  }));

  const trackStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => {
        void Haptics.selectionAsync();
        onChange(!value);
      }}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <View style={s.track}>
        <Animated.View style={[s.gradient, trackStyle]}>
          <LinearGradient
            colors={[...t.gradient.colors]}
            start={t.gradient.horizontal.start}
            end={t.gradient.horizontal.end}
            style={s.gradient}
          />
        </Animated.View>
        <Animated.View style={[s.knob, knobStyle]} />
      </View>
    </Pressable>
  );
}
