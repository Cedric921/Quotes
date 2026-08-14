import React, { type PropsWithChildren, type ReactNode } from "react";
import { ImageBackground, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SurfaceProvider, makeStyles, useTheme } from "../theme";

const fill = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

const useStyles = makeStyles((t) => ({
  root: { flex: 1, backgroundColor: t.base.bg },
  rootImage: { flex: 1, backgroundColor: t.palette.ink900 },
  image: { flex: 1 },
  scrim: { ...fill, backgroundColor: t.image.scrim },
  body: { flex: 1, paddingHorizontal: t.gutter },
  bodyFlush: { flex: 1 },
  footer: { paddingHorizontal: t.gutter, paddingTop: t.space.md },
}));

export interface ScreenProps extends PropsWithChildren {
  /** `base` = solid background. `image` = full-bleed photo with translucent chrome. */
  variant?: "base" | "image";
  /** Photo URI, required when `variant="image"`. */
  imageUri?: string;
  /** Pinned above the safe-area bottom inset — usually the primary CTA. */
  footer?: ReactNode;
  /** Rendered under the status bar, before the body. */
  header?: ReactNode;
  /** Skip the horizontal gutter, for grids and feeds that bleed to the edge. */
  flush?: boolean;
  /** Skip the top safe-area padding (sheets draw their own handle). */
  ignoreTopInset?: boolean;
}

/**
 * Every screen starts here. It owns the safe area — v1 handled it in 10 of 19
 * screens, which is why the notch clipped titles on the other 9.
 */
export function Screen({
  variant = "base",
  imageUri,
  header,
  footer,
  flush,
  ignoreTopInset,
  children,
}: ScreenProps) {
  const s = useStyles();
  const t = useTheme();
  const insets = useSafeAreaInsets();

  const content = (
    <>
      <StatusBar
        barStyle={variant === "image" ? "light-content" : "dark-content"}
        translucent
      />
      <View
        style={{
          paddingTop: ignoreTopInset ? 0 : insets.top,
          flex: 1,
        }}
      >
        {header}
        <View style={flush ? s.bodyFlush : s.body}>{children}</View>
        {footer ? (
          <View
            style={[
              s.footer,
              { paddingBottom: Math.max(insets.bottom, t.space.lg) },
            ]}
          >
            {footer}
          </View>
        ) : null}
      </View>
    </>
  );

  if (variant === "image") {
    return (
      <SurfaceProvider surface="image">
        <View style={s.rootImage}>
          <ImageBackground
            source={imageUri ? { uri: imageUri } : undefined}
            style={s.image}
            resizeMode="cover"
          >
            <View style={s.scrim} pointerEvents="none" />
            {content}
          </ImageBackground>
        </View>
      </SurfaceProvider>
    );
  }

  return (
    <SurfaceProvider surface="base">
      <View style={s.root}>{content}</View>
    </SurfaceProvider>
  );
}
