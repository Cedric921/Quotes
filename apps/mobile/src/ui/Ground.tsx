import React from "react";
import { Image, View } from "react-native";
import { makeStyles } from "../theme";

const TEXTURE = require("../../assets/images/brushed-silver.png");

const useStyles = makeStyles((t) => ({
  // A view sized by its insets, and the image sized by the view: a
  // percentage height on the image resolved against the parent's content
  // box, and under the sheet's top padding it left a strip of flat colour
  // along the bottom.
  frame: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: t.base.bg,
  },
  image: { width: "100%", height: "100%" },
}));

/**
 * The `base` surface's ground: brushed aluminium.
 *
 * A flat colour reads as grey and a linear gradient reads as a slab lit
 * from one side; the design's white is a sheet of metal with light pooling
 * on it in several places, darker bands between, and a fine grain over it
 * all. That is an image (`scripts/brushed-metal.py` draws it), laid once
 * under every base screen and sheet; nothing else in the tree knows it is
 * there. Raised surfaces take `MetalFill`, a lighter cut of the same sheet.
 */
export function Ground() {
  const s = useStyles();
  return (
    <View
      style={s.frame}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Image source={TEXTURE} style={s.image} resizeMode="cover" accessible={false} />
    </View>
  );
}
