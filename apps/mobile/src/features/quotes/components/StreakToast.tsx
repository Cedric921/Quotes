import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { makeStyles, useTheme } from "../../../theme";
import { Card, Text } from "../../../ui";
import { StreakWeek } from "../../streak/StreakWeek";

const VISIBLE_MS = 3200;

const useStyles = makeStyles((t) => ({
  wrap: {
    position: "absolute",
    left: t.gutter,
    right: t.gutter,
  },
  title: { marginBottom: t.space.sm },
}));

export interface StreakToastProps {
  visible: boolean;
  count: number;
  labels: string[];
  completed: number[];
  onHide: () => void;
}

/**
 * Drops in over the feed when the streak advances, then leaves on its own.
 *
 * The only opaque surface allowed on top of a photo — a translucent card here
 * would make the flame illegible against a bright image.
 */
export function StreakToast({
  visible,
  count,
  labels,
  completed,
  onHide,
}: StreakToastProps) {
  const s = useStyles();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    progress.value = withTiming(1, { duration: t.motion.base });
    progress.value = withDelay(
      VISIBLE_MS,
      withTiming(0, { duration: t.motion.base }, (finished) => {
        if (finished) runOnJS(onHide)();
      }),
    );
  }, [visible, progress, onHide, t.motion.base]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -24 }],
  }));

  const { t: translate } = useTranslation();

  if (!visible) return null;

  return (
    <Animated.View
      style={[s.wrap, { top: insets.top + t.space.xs }, style]}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
    >
      <Card variant="overlay">
        <View>
          <Text variant="label" align="center" style={s.title}>
            {translate("streak.toast.title")}
          </Text>
          <StreakWeek count={count} labels={labels} completed={completed} />
        </View>
      </Card>
    </Animated.View>
  );
}
