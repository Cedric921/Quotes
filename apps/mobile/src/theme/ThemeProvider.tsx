import React, {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";
import { useAppSelector } from "../store/hooks";
import {
  baseSurface,
  imageSurface,
  gradient,
  space,
  radius,
  border,
  motion,
  typography,
  gutter,
  hitSize,
  palette,
  shadow,
} from "./tokens";

/**
 * The app draws on two surfaces, and they are not two shades of one theme:
 *
 *   `base`  — solid background. Onboarding, sheets, settings.
 *   `image` — chrome over a full-bleed photo. The quote feed.
 *
 * A component declares the surface it lives on; it never picks a colour.
 */
export type Surface = "base" | "image";

export interface Theme {
  surface: Surface;
  base: typeof baseSurface;
  image: typeof imageSurface;
  gradient: typeof gradient;
  palette: typeof palette;
  space: typeof space;
  radius: typeof radius;
  border: typeof border;
  motion: typeof motion;
  typography: typeof typography;
  shadow: typeof shadow;
  gutter: number;
  hitSize: number;
  /** Font family served by the API for the current background theme. */
  quoteFontFamily?: string;
  /** Primary text colour for the current surface. */
  fg: string;
  /** Secondary text colour for the current surface. */
  fgDim: string;
}

const buildTheme = (surface: Surface, quoteFontFamily?: string): Theme => ({
  surface,
  base: baseSurface,
  image: imageSurface,
  gradient,
  palette,
  space,
  radius,
  border,
  motion,
  typography,
  shadow,
  gutter,
  hitSize,
  quoteFontFamily,
  fg: surface === "image" ? imageSurface.text : baseSurface.textPrimary,
  fgDim: surface === "image" ? imageSurface.textDim : baseSurface.textSecondary,
});

const ThemeContext = createContext<Theme>(buildTheme("base"));

/**
 * Root provider. Reads the API-served font from the store so the quote
 * variant picks it up everywhere without prop drilling.
 */
export function ThemeProvider({ children }: PropsWithChildren) {
  const selectedFont = useAppSelector((s) => s.font.selectedFont);
  const backgroundTheme = useAppSelector((s) => s.theme.backgroundTheme);

  // A theme can carry its own font; an explicit font choice wins over it.
  const quoteFontFamily =
    selectedFont?.fontFamily ?? backgroundTheme?.fontFamily ?? undefined;

  const value = useMemo(
    () => buildTheme("base", quoteFontFamily),
    [quoteFontFamily],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Switches the surface for a subtree. `Screen variant="image"` uses this,
 * so anything rendered inside it resolves `image` colours automatically.
 */
export function SurfaceProvider({
  surface,
  children,
}: PropsWithChildren<{ surface: Surface }>) {
  const parent = useContext(ThemeContext);
  const value = useMemo(
    () =>
      parent.surface === surface
        ? parent
        : buildTheme(surface, parent.quoteFontFamily),
    [parent, surface],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = (): Theme => useContext(ThemeContext);

/** True when the subtree is drawing over a photo. */
export const useOnImage = (): boolean => useContext(ThemeContext).surface === "image";
