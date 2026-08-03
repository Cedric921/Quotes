import React from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { makeStyles, useTheme } from "../../../theme";

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: t.space.xxl,
    paddingVertical: t.space.md,
  },
  button: {
    minWidth: t.hitSize,
    minHeight: t.hitSize,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.6 },
}));

export interface QuoteActionsProps {
  liked: boolean;
  onLike: () => void;
  onShare: () => void;
  /** Measured so the first-run coachmark can point at the heart. */
  onLikeLayout?: (rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
}

/**
 * Share and like, centred low on the screen.
 *
 * No labels and no background: the quote is the content, and any chrome here
 * competes with it. Two icons is the whole vocabulary.
 */
export function QuoteActions({
  liked,
  onLike,
  onShare,
  onLikeLayout,
}: QuoteActionsProps) {
  const s = useStyles();
  const t = useTheme();

  return (
    <View style={s.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Partager"
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onShare();
        }}
        style={({ pressed }) => [s.button, pressed ? s.pressed : null]}
      >
        <Ionicons name="share-outline" size={34} color={t.image.text} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="J'aime"
        accessibilityState={{ selected: liked }}
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onLike();
        }}
        onLayout={(e) =>
          onLikeLayout?.({
            x: e.nativeEvent.layout.x,
            y: e.nativeEvent.layout.y,
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          })
        }
        style={({ pressed }) => [s.button, pressed ? s.pressed : null]}
      >
        <Ionicons
          name={liked ? "heart" : "heart-outline"}
          size={34}
          color={t.image.text}
        />
      </Pressable>
    </View>
  );
}
