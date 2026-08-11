import React from "react";
import { Image, Pressable, View } from "react-native";
import type { Ionicons } from "@expo/vector-icons";
import { makeStyles } from "../../../theme";
import { Text, TileArt } from "../../../ui";

const useStyles = makeStyles((t) => ({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: t.space.sm },
  tile: {
    width: "48.5%",
    height: 190,
    borderRadius: t.radius.lg,
    backgroundColor: t.base.bgElevated,
    padding: t.space.md,
    overflow: "hidden",
  },
  title: { marginBottom: t.space.xs },
  art: {
    flex: 1,
    width: "100%",
  },
  wide: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: t.space.md,
    height: 150,
  },
  wideCopy: { flex: 1, gap: t.space.xxs },
  wideArt: { width: 130, height: 110 },
  pressed: { opacity: 0.75 },
}));

export interface FeatureTile {
  id: string;
  title: string;
  /** Second line, used only by the full-width tile at the bottom. */
  subtitle?: string;
  illustration?: number;
  /** Drawn when no illustration asset exists — which is every tile today. */
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  wide?: boolean;
  /**
   * Set false for a tile whose feature doesn't exist yet. The grid drops it
   * rather than rendering something that opens nothing — the design keeps the
   * slot, the build doesn't ship the dead end.
   */
  enabled?: boolean;
}

/**
 * Two-column grid of everything the user can customise.
 *
 * The title sits top-left and the illustration fills underneath, so a column
 * of tiles scans as a list of labels — you read the grid, you don't decode it.
 */
export function FeatureGrid({ tiles }: { tiles: FeatureTile[] }) {
  const s = useStyles();

  return (
    <View style={s.grid}>
      {tiles
        .filter((tile) => tile.enabled !== false)
        .map((tile) => (
          <Pressable
            key={tile.id}
            accessibilityRole="button"
            accessibilityLabel={tile.title}
            onPress={tile.onPress}
            style={({ pressed }) => [
              s.tile,
              tile.wide ? s.wide : null,
              pressed ? s.pressed : null,
            ]}
          >
            {tile.wide ? (
              <>
                <View style={s.wideCopy}>
                  <Text variant="title">{tile.title}</Text>
                  {tile.subtitle ? (
                    <Text variant="body" tone="dim">
                      {tile.subtitle}
                    </Text>
                  ) : null}
                </View>
                {tile.illustration ? (
                  <Image
                    source={tile.illustration}
                    style={s.wideArt}
                    resizeMode="contain"
                  />
                ) : tile.icon ? (
                  <View style={s.wideArt}>
                    <TileArt icon={tile.icon} size={96} />
                  </View>
                ) : null}
              </>
            ) : (
              <>
                <Text variant="body" style={s.title}>
                  {tile.title}
                </Text>
                {tile.illustration ? (
                  <Image
                    source={tile.illustration}
                    style={s.art}
                    resizeMode="contain"
                  />
                ) : tile.icon ? (
                  <View style={s.art}>
                    <TileArt icon={tile.icon} />
                  </View>
                ) : null}
              </>
            )}
          </Pressable>
        ))}
    </View>
  );
}
