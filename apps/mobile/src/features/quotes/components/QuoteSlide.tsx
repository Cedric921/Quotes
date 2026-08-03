import React from "react";
import { ImageBackground, View } from "react-native";
import { SurfaceProvider, makeStyles } from "../../../theme";
import { Text } from "../../../ui";
import type { Quote } from "../../../types";

const useStyles = makeStyles((t) => ({
  slide: { width: "100%" },
  image: { flex: 1 },
  scrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: t.image.scrim,
  },
  body: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: t.space.xl,
  },
  author: { marginTop: t.space.md },
}));

export interface QuoteSlideProps {
  quote: Quote;
  imageUri?: string;
  height: number;
}

/**
 * One full-height page of the feed.
 *
 * The text is vertically centred rather than pinned, because the background
 * photo is chosen by the user and we cannot know where its subject sits —
 * centre is the only position that never lands on a face.
 */
export function QuoteSlide({ quote, imageUri, height }: QuoteSlideProps) {
  const s = useStyles();

  return (
    <SurfaceProvider surface="image">
      <View style={[s.slide, { height }]}>
        <ImageBackground
          source={imageUri ? { uri: imageUri } : undefined}
          style={s.image}
          resizeMode="cover"
        >
          <View style={s.scrim} pointerEvents="none" />
          <View style={s.body}>
            <Text variant="quote" align="center" accessibilityRole="text">
              {quote.text}
            </Text>
            {quote.author ? (
              <Text variant="body" tone="dim" align="center" style={s.author}>
                {quote.author}
              </Text>
            ) : null}
          </View>
        </ImageBackground>
      </View>
    </SurfaceProvider>
  );
}
