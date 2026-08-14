/**
 * Design tokens — Focus v2.
 *
 * This is the ONLY file in the app allowed to contain colour literals.
 * Everything else consumes these tokens through `useTheme()` / `useStyles()`.
 * See docs/DESIGN_SYSTEM_V2.md §2.
 */

export const palette = {
  // Ink — the dark family. The quote feed's ground, the widgets, the
  // on-image cards, and every piece of text on the silver surface.
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

  // Silver — the light family the `base` surface is drawn in: a cool,
  // metallic white rather than a warm paper white, so it sits with the
  // ink text and the violet accent instead of fighting them.
  silver50: "#F5F7FA",
  silver100: "#EDF0F4",
  silver200: "#E2E7ED",
  silver300: "#D3DAE3",
  silver400: "#C3CCD7",

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

/**
 * Surface `base`: solid-background screens (onboarding, settings, sheets).
 *
 * Silver-white, ink text, ink CTA. The surface was ink until the app was
 * asked to be light; because every component reads it from here, that was
 * a change to this block and to the handful of primitives that had assumed
 * a dark ground (the status bar, the toggle track, the selection badge, the
 * sheet's glass footer, the widget mock-ups).
 */
export const baseSurface = {
  /**
   * The colour under the brushed-metal ground (`ui/Ground`), and what shows
   * while it loads. The ground itself is an image: a flat colour cannot be
   * brushed.
   */
  bg: palette.silver200,
  bgElevated: palette.silver50,
  surfaceRaised: palette.silver300,
  /**
   * The one opaque card laid over a photo — the streak toast, the coachmark
   * bubble. It stays ink: it belongs to the image surface's world, not to
   * the silver one, and its text is white.
   */
  surfaceOverlay: palette.ink400,
  /** Off-state of a control: toggle track, the streak's empty days. */
  control: palette.silver400,

  borderSubtle: palette.silver300,
  borderStrong: palette.ink900,

  textPrimary: palette.ink900,
  textSecondary: palette.ink300,
  textTertiary: palette.slate300,

  ctaBg: palette.ink900,
  ctaFg: palette.white,
  ctaDisabledBg: palette.grey400,
  ctaDisabledFg: palette.white,
  /** Type on the accent gradient — the pastel fill wants ink, not white. */
  onAccent: palette.ink900,

  danger: palette.coral,
  success: palette.mint,
  warning: palette.amber,

  /** The sheet's floating footer: frosted silver, not dark glass. */
  glass: "rgba(255,255,255,0.72)",
  glassBorder: "rgba(21,28,39,0.10)",

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

/**
 * Android home-screen widget.
 *
 * It renders through `react-native-android-widget`, outside React's tree —
 * no provider, no hooks — so it reads these values directly. They live here
 * rather than in the widget file so the widget can never drift from the app's
 * accent the way v1's indigo did.
 *
 * The spaces after the commas are load-bearing: the library types its colours
 * as `` `rgba(${number}, ${number}, ${number}, ${number})` ``, so the compact
 * form the rest of this file uses does not compile there.
 */
export const widgetSurface = {
  /** The card. Ink, like the design's widget preview — never the gradient. */
  card: palette.ink900,
  /** The accent's one job on a widget: a 1.5 px contour around the card. */
  gradientFrom: palette.violet,
  gradientTo: palette.blush,
  contour: 1.5,

  text: palette.white,
  textDim: palette.slate200,
  textFaint: palette.slate300,
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

/**
 * The lift a card gets off the metal. One recipe, so every raised surface
 * — card, tile, round button, settings group — sits at the same height.
 * Android reads `elevation`, iOS the rest.
 */
export const shadow = {
  card: {
    shadowColor: palette.ink900,
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  /** Tighter, for a 52 px button. */
  button: {
    shadowColor: palette.ink900,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
} as const;

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
export type WidgetSurface = typeof widgetSurface;
export type BaseSurface = typeof baseSurface;
export type ImageSurface = typeof imageSurface;
export type TypographyVariant = keyof typeof typography;
