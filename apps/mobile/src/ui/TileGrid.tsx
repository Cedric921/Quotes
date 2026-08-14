import React from "react";
import {
  Image,
  Pressable,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { makeStyles, useTheme } from "../theme";
import { Text } from "./Text";

const COLUMNS = 3;

const useStyles = makeStyles((t) => ({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: t.space.sm,
  },
  tile: {
    overflow: "hidden",
    backgroundColor: t.base.bgElevated,
  },
  image: { width: "100%", height: "100%" },
  fill: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  logo: { width: "58%", height: "58%" },
  centre: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    borderWidth: t.border.selected + 1,
    borderColor: t.base.borderStrong,
  },
  badge: {
    position: "absolute",
    top: t.space.xs,
    right: t.space.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: t.base.ctaBg,
    alignItems: "center",
    justifyContent: "center",
  },
  motionBadge: {
    position: "absolute",
    top: t.space.xs,
    left: t.space.xs,
  },
}));

export interface Tile {
  id: string;
  imageUri?: string;
  /**
   * A flat colour or a two-stop gradient behind the tile, for tiles drawn from
   * tokens rather than loaded from a file — the app icon variants.
   */
  backdrop?: string | readonly [string, string];
  /** A mark centred on the backdrop, tinted to sit on it. */
  logo?: { source: ImageSourcePropType; tint: string };
  /** Sample glyph drawn over the tile — "Aa" for themes, "”" for app icons. */
  sample?: string;
  /** Marks a theme whose background is animated. */
  animated?: boolean;
}

export interface TileGridProps {
  tiles: Tile[];
  selectedId?: string;
  onSelect: (id: string) => void;
  /** `theme` is a 3:4 portrait card; `icon` is a squircle app icon. */
  shape?: "theme" | "icon";
  /** Horizontal padding already applied by the parent, so we can size columns. */
  horizontalPadding?: number;
}

/**
 * Three-column picker used twice: background themes (portrait cards) and
 * app icons (squircles). Selection is a white check badge; for app icons it
 * is additionally a ring, because the badge would cover the artwork.
 */
export function TileGrid({
  tiles,
  selectedId,
  onSelect,
  shape = "theme",
  horizontalPadding,
}: TileGridProps) {
  const s = useStyles();
  const t = useTheme();
  const { width } = useWindowDimensions();

  const pad = horizontalPadding ?? t.gutter;
  const gaps = t.space.sm * (COLUMNS - 1);
  const size = (width - pad * 2 - gaps) / COLUMNS;
  const height = shape === "theme" ? size * (4 / 3) : size;
  const tileRadius = shape === "theme" ? t.radius.lg : t.radius.xl;

  return (
    <View style={s.grid}>
      {tiles.map((tile) => {
        const selected = tile.id === selectedId;
        return (
          <Pressable
            key={tile.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={tile.id}
            onPress={() => onSelect(tile.id)}
            style={[
              s.tile,
              { width: size, height, borderRadius: tileRadius },
              selected && shape === "icon" ? s.ring : null,
            ]}
          >
            {typeof tile.backdrop === "string" ? (
              <View style={[s.fill, { backgroundColor: tile.backdrop }]} />
            ) : tile.backdrop ? (
              <LinearGradient
                colors={tile.backdrop}
                start={t.gradient.diagonal.start}
                end={t.gradient.diagonal.end}
                style={s.fill}
              />
            ) : null}

            {tile.imageUri ? (
              <Image source={{ uri: tile.imageUri }} style={s.image} />
            ) : null}

            {tile.logo ? (
              <View style={s.centre}>
                <Image
                  source={tile.logo.source}
                  style={[s.logo, { tintColor: tile.logo.tint }]}
                  resizeMode="contain"
                />
              </View>
            ) : null}

            {tile.sample ? (
              <View style={s.centre}>
                <Text variant="quote" style={{ fontSize: 24, lineHeight: 30 }}>
                  {tile.sample}
                </Text>
              </View>
            ) : null}

            {tile.animated ? (
              <View style={s.motionBadge}>
                <Ionicons
                  name="play-circle-outline"
                  size={22}
                  color={t.image.text}
                />
              </View>
            ) : null}

            {selected ? (
              <View style={s.badge}>
                <Ionicons name="checkmark" size={18} color={t.base.ctaFg} />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
