import React from "react";
import { Image } from "react-native";
import { makeStyles } from "../theme";

const TEXTURE = require("../../assets/images/brushed-silver.png");

const useStyles = makeStyles((t) => ({
  fill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    backgroundColor: t.base.bg,
  },
}));

/**
 * The `base` surface's ground: brushed silver.
 *
 * A flat colour reads as grey; the design's white is metal — a light sheen
 * with fine diagonal grain. That is an image, drawn once under every base
 * screen and sheet, and nothing else in the tree knows it is there.
 */
export function Ground() {
  const s = useStyles();
  return (
    <Image
      source={TEXTURE}
      style={s.fill}
      resizeMode="cover"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    />
  );
}
