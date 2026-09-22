import React from "react";
import { Modal, Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import { makeStyles, useTheme } from "../theme";
import { Text } from "./Text";

const ARROW = 12;

const useStyles = makeStyles((t) => ({
  backdrop: {
    flex: 1,
    backgroundColor: t.image.scrimStrong,
  },
  bubble: {
    position: "absolute",
    borderRadius: t.radius.md,
    backgroundColor: t.base.surfaceOverlay,
    paddingVertical: t.space.sm,
    paddingHorizontal: t.space.md,
  },
  arrow: {
    position: "absolute",
    width: 0,
    height: 0,
    borderLeftWidth: ARROW,
    borderRightWidth: ARROW,
    borderTopWidth: ARROW,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: t.base.surfaceOverlay,
  },
  /** Cut-out that keeps the target visible through the dimmed backdrop. */
  spotlight: {
    position: "absolute",
    borderRadius: t.radius.md,
    backgroundColor: t.image.chrome,
  },
}));

export interface CoachmarkProps {
  visible: boolean;
  message: string;
  /** Screen-space rect of the element being pointed at. */
  target: { x: number; y: number; width: number; height: number };
  onDismiss: () => void;
}

/**
 * Dims the screen, keeps the target lit, and points a bubble at it.
 * Used once, on first launch, to explain that five favourites personalise
 * the feed. Tapping anywhere dismisses it.
 */
export function Coachmark({
  visible,
  message,
  target,
  onDismiss,
}: CoachmarkProps) {
  const s = useStyles();
  const t = useTheme();
  const { t: translate } = useTranslation();

  if (!visible) return null;

  const bubbleBottom = target.y - ARROW - t.space.xs;
  const arrowLeft = target.x + target.width / 2 - ARROW;

  return (
    <Modal transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable
        style={s.backdrop}
        accessibilityRole="button"
        accessibilityLabel={translate("common.close")}
        onPress={onDismiss}
      >
        <View
          style={[
            s.spotlight,
            {
              left: target.x - t.space.xs,
              top: target.y - t.space.xs,
              width: target.width + t.space.md,
              height: target.height + t.space.md,
            },
          ]}
          pointerEvents="none"
        />

        <View
          style={[
            s.bubble,
            {
              left: t.gutter,
              right: t.gutter,
              bottom: undefined,
              top: bubbleBottom - 96,
            },
          ]}
          pointerEvents="none"
        >
          <Text variant="body">{message}</Text>
        </View>

        <View
          style={[s.arrow, { left: arrowLeft, top: bubbleBottom }]}
          pointerEvents="none"
        />
      </Pressable>
    </Modal>
  );
}
