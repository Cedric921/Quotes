import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "../theme";

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
 * The design's tiles and funnel screens carry bespoke 3D drawings, and none of
 * them are in this repo — they rendered as a title over empty space. This is
 * the same composition made from what the app already ships: the accent
 * gradient as a glow, the subject's own icon on top. It reads as artwork
 * rather than as a missing asset, and every caller prefers a real
 * illustration the moment one is passed.
 */
export function TileArt({ icon, size = 120 }: TileArtProps) {
  const s = useStyles();
  const t = useTheme();

  const glow = { width: size, height: size };
  const core = { width: size * 0.56, height: size * 0.56 };

  return (
    <View style={s.wrap}>
      <LinearGradient
        colors={[...t.gradient.colors]}
        start={t.gradient.diagonal.start}
        end={t.gradient.diagonal.end}
        style={[s.glow, glow]}
      />
      <LinearGradient
        colors={[...t.gradient.colors]}
        start={t.gradient.diagonal.start}
        end={t.gradient.diagonal.end}
        style={[s.core, core]}
      />
      <Ionicons name={icon} size={size * 0.34} color={t.base.textPrimary} />
    </View>
  );
}
