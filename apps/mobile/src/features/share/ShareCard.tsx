import React, { forwardRef } from "react";
import { ImageBackground, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SurfaceProvider, makeStyles, useTheme } from "../../theme";
import { Text } from "../../ui";
import type { Quote } from "../../types";
import { WATERMARK } from "../../constants/appConfig";

/** 9:16, so the export drops straight into a story without letterboxing. */
export const SHARE_ASPECT = 9 / 16;

const useStyles = makeStyles((t) => ({
  card: { overflow: "hidden", borderRadius: t.radius.lg },
  image: { flex: 1, justifyContent: "center" },
  scrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: t.image.scrim,
  },
  body: { paddingHorizontal: t.space.xl, alignItems: "center" },
  watermark: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.space.xxs,
    marginTop: t.space.md,
    paddingHorizontal: t.space.sm,
    paddingVertical: t.space.xxs,
    borderRadius: t.radius.sm,
    backgroundColor: t.image.chrome,
    borderWidth: t.border.hairline,
    borderColor: t.image.chromeBorder,
  },
}));

export interface ShareCardProps {
  quote: Quote;
  imageUri?: string;
  width: number;
  /** Premium users can turn the watermark off. */
  showWatermark?: boolean;
}

/**
 * What actually gets exported when the user shares.
 *
 * v1 screenshotted the live screen, which meant the like counter, the nav
 * buttons and the status bar all ended up in the shared image. This is a
 * separate composition captured off-screen: quote, background, watermark,
 * nothing else.
 */
export const ShareCard = forwardRef<View, ShareCardProps>(function ShareCard(
  { quote, imageUri, width, showWatermark = true },
  ref,
) {
  const s = useStyles();
  const t = useTheme();

  return (
    <SurfaceProvider surface="image">
      <View
        ref={ref}
        collapsable={false}
        style={[s.card, { width, height: width / SHARE_ASPECT }]}
      >
        <ImageBackground
          source={imageUri ? { uri: imageUri } : undefined}
          style={s.image}
          resizeMode="cover"
        >
          <View style={s.scrim} pointerEvents="none" />
          <View style={s.body}>
            <Text variant="quote" align="center">
              {quote.text}
            </Text>

            {showWatermark ? (
              <View style={s.watermark}>
                <Ionicons name="chatbox" size={14} color={t.image.text} />
                <Text variant="caption">{WATERMARK}</Text>
              </View>
            ) : null}
          </View>
        </ImageBackground>
      </View>
    </SurfaceProvider>
  );
});
