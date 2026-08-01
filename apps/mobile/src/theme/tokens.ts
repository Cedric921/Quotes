/**
 * Design tokens — Focus v2.
 *
 * This is the ONLY file in the app allowed to contain colour literals.
 * Everything else consumes these tokens through `useTheme()` / `useStyles()`.
 * See docs/DESIGN_SYSTEM_V2.md §2.
 */

export const palette = {
  // Neutrals — the app's single background family.
  ink900: "#151C27",
  ink800: "#1A222E",
  ink700: "#232D3B",
  ink600: "#2B3645",
  ink500: "#343F4F",
  ink400: "#3A4655",
  ink300: "#5A6579",
  slate300: "#8A94A6",
  slate200: "#B5C2D6",
  white: "#FFFFFF",

  // Accent — celebration & conversion only, never a page background.
  violet: "#8B7FE8",
  blush: "#F2A8B4",

  // Feedback
  coral: "#FF6B6B",
  mint: "#3ECF8E",
  amber: "#F5A524",

  // Disabled CTA — a flat grey, not a tinted neutral.
  grey400: "#A0A6AE",
} as const;

/** Surface `base`: solid-background screens (onboarding, settings, sheets). */
export const baseSurface = {
  bg: palette.ink700,
  bgElevated: palette.ink600,
  surfaceRaised: palette.ink500,
  surfaceOverlay: palette.ink400,

  borderSubtle: palette.ink500,
  borderStrong: palette.white,

  textPrimary: palette.white,
  textSecondary: palette.slate200,
  textTertiary: palette.slate300,

  ctaBg: palette.white,
  ctaFg: palette.ink900,
  ctaDisabledBg: palette.grey400,
  ctaDisabledFg: palette.ink900,

  danger: palette.coral,
  success: palette.mint,
  warning: palette.amber,

  scrim: "rgba(0,0,0,0.55)",
} as const;

/**
 * Surface `image`: chrome laid over a full-bleed photo.
 * Nothing here is opaque except the streak toast, which borrows
 * `baseSurface.surfaceOverlay`.
 */
export const imageSurface = {
  text: palette.white,
  textDim: "rgba(255,255,255,0.72)",

  chrome: "rgba(255,255,255,0.15)",
  chromePressed: "rgba(255,255,255,0.26)",
  chromeBorder: "rgba(255,255,255,0.22)",

  /** Darkens the photo just enough for the quote to hold contrast. */
  scrim: "rgba(0,0,0,0.25)",
  /** Heavier scrim used while a coachmark or sheet is open. */
  scrimStrong: "rgba(0,0,0,0.72)",

  blurIntensity: 24,
} as const;

/** The accent gradient. Four sanctioned uses — see spec §2.3. */
export const gradient = {
  from: palette.violet,
  to: palette.blush,
  /** Left→right for CTAs and toggle tracks. */
  horizontal: { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
  /** Top→bottom for the trial timeline rail and the streak flame. */
  vertical: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
  /** Diagonal for filled promo banners. */
  diagonal: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  /** Banner reads pink→violet, the reverse of every other gradient. */
  colorsReversed: [palette.blush, palette.violet] as const,
  colors: [palette.violet, palette.blush] as const,
} as const;

export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 56,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

/** Horizontal screen margin. Constant across every screen in the app. */
export const gutter = space.md;

export const border = {
  hairline: 1,
  /** Selected option outline. Deliberately heavier than hairline. */
  selected: 1.5,
} as const;

export const motion = {
  fast: 140,
  base: 220,
  slow: 320,
  /** Like burst: scale up fast, fade out slowly. */
  burstIn: 180,
  burstOut: 420,
} as const;

export const typography = {
  display: { size: 30, lineHeight: 38, weight: "700" },
  title: { size: 22, lineHeight: 28, weight: "700" },
  body: { size: 17, lineHeight: 24, weight: "400" },
  label: { size: 15, lineHeight: 20, weight: "600" },
  caption: { size: 13, lineHeight: 18, weight: "400" },
  /** The quote, and nothing else. Family is overridden by the API-served font. */
  quote: { size: 28, lineHeight: 40, weight: "400" },
} as const;

/** Minimum tappable area, both axes. */
export const hitSize = 44;

export type Palette = typeof palette;
export type BaseSurface = typeof baseSurface;
export type ImageSurface = typeof imageSurface;
export type TypographyVariant = keyof typeof typography;
