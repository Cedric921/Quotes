import React from "react";
import { Image, View } from "react-native";
import { makeStyles, type Theme } from "../theme";

const TEXTURE = require("../../assets/images/brushed-silver-card.png");

const useStyles = makeStyles((t) => ({
  /**
   * A view sized by its insets, and the image sized by the view. The image
   * cannot do it alone: given insets only it keeps its intrinsic size and
   * spills out of the card, and given a percentage size it resolves against
   * the card's content box and stops short of the padding.
   */
  frame: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  image: { width: "100%", height: "100%" },
  sm: { borderRadius: t.radius.sm },
  md: { borderRadius: t.radius.md },
  lg: { borderRadius: t.radius.lg },
  xl: { borderRadius: t.radius.xl },
  pill: { borderRadius: t.radius.pill },
}));

export interface MetalFillProps {
  /** The corner radius of the surface it fills — must match the parent's. */
  radius: keyof Theme["radius"];
}

/**
 * The brushed-metal fill of a raised surface: cards, rows, options, chips.
 *
 * Every card used to be a flat white; the design's cards are cut from the
 * same sheet as the ground, a lighter strip of it with its own reflections,
 * lifted by `shadow.card`. Render it as the first child of a rounded parent
 * that keeps its own `backgroundColor` (iOS needs an opaque view to draw a
 * shadow) and does not clip overflow (that would clip the shadow instead).
 */
export function MetalFill({ radius }: MetalFillProps) {
  const s = useStyles();
  return (
    <View
      style={s.frame}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Image
        source={TEXTURE}
        style={[s.image, s[radius]]}
        resizeMode="cover"
        accessible={false}
      />
    </View>
  );
}
