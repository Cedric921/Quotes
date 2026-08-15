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
  // Sky blue running into an indigo violet. It replaced a pink-to-violet
  // pair at the client's request; nothing else in the app reads as pink
  // now, illustrations included.
  sky: "#87CEEB",
  indigo: "#5E5CE6",

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
  /**
   * Under a raised surface's `MetalFill`, and the round buttons' fill:
   * white, so the shadow has an opaque view to hang from and a button
   * lifts off the metal.
   */
  bgElevated: palette.white,
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

  /**
   * The primary pill: white, with ink type — the client's call, after a
   * graphite pass. It reads off the metal by its shadow and a hairline of
   * ink at very low alpha; the short vertical gradient keeps it from
   * looking like a paper cut-out.
   */
  ctaBg: palette.white,
  ctaGradient: [palette.white, palette.silver50] as const,
  ctaBorder: "rgba(21,28,39,0.08)",
  ctaFg: palette.ink900,
  ctaDisabledBg: palette.grey400,
  ctaDisabledFg: palette.white,
  /**
   * The one solid ink the light surface keeps: the selection badge on an
   * option row or a tile, and the app-icon tile in the notification
   * preview. It used to borrow `ctaBg`; it stops borrowing the day the CTA
   * goes white.
   */
  badgeBg: palette.ink900,
  badgeFg: palette.white,
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
  gradientFrom: palette.sky,
  gradientTo: palette.indigo,
  contour: 1.5,

  text: palette.white,
  textDim: palette.slate200,
  textFaint: palette.slate300,
} as const;

/**
 * The accent gradient. Four sanctioned uses — see spec §2.3.
 *
 * Always light→dark, sky→indigo, in the reading direction: left to right,
 * top to bottom. That puts the pale end under the ink type a banner or a
 * CTA carries and the dark end under a toggle's knob, so neither vanishes
 * into its ground.
 */
export const gradient = {
  from: palette.sky,
  to: palette.indigo,
  /** Left→right for CTAs, toggle tracks and the promo banner. */
  horizontal: { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
  /** Top→bottom for the trial timeline rail and the streak flame. */
  vertical: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
  /** Diagonal for gradient outlines and the tile art. */
  diagonal: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  colors: [palette.sky, palette.indigo] as const,
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
  /**
   * Tighter, for a 52 px round button. Deeper than the card's: a white disc
   * on a white-ish metal has nothing but its shadow to be seen by.
   */
  button: {
    shadowColor: palette.ink900,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  /**
   * For a row in a stack — an option, a chip, a time row. Lighter and
   * tighter than the card's: with a 12 px gap, a card's shadow lands on
   * the row below and the list reads as a flight of dark ledges.
   */
  row: {
    shadowColor: palette.ink900,
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  /** The primary pill's own lift. */
  cta: {
    shadowColor: palette.ink900,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
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
