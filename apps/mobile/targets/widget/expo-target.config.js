/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  name: "FocusWidget",
  displayName: "Focus",
  icon: "../../assets/icon.png",
  deploymentTarget: "17.0",

  // The v2 palette, by hand: the widget is compiled outside Metro and cannot
  // import `src/theme/tokens.ts`. These are `palette.ink900`, `accent.from`,
  // `accent.to`, `white` and `slate200` from that file — change them together.
  //
  // The widget is a dark card in both appearances. The design's rule is
  // "the gradient is an accent, never a background": the card is ink, the
  // gradient is the 1.5 px contour around it. v1 painted the whole widget
  // indigo→purple, a look that existed nowhere else in the product.
  colors: {
    $accent: "#8B7FE8",
    $widgetBackground: "#151C27",
    gradientStart: "#8B7FE8",
    gradientEnd: "#F2A8B4",
    textPrimary: "#FFFFFF",
    textSecondary: "#B5C2D6",
  },

  // The Focus mark, drawn as a template so SwiftUI tints it.
  images: {
    focusMark: "../../assets/images/source-icon-white.png",
  },
});
