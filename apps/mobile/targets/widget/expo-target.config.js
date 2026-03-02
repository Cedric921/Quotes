/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  name: "FocusWidget",
  displayName: "Focus",
  icon: "../../assets/icon.png",
  deploymentTarget: "17.0",
  
  // Colors used in the widget
  colors: {
    $accent: "#6366f1", // Indigo primary color
    $widgetBackground: { light: "#ffffff", dark: "#1a1a2e" },
    gradientStart: { light: "#6366f1", dark: "#4f46e5" },
    gradientEnd: { light: "#a855f7", dark: "#7c3aed" },
    textPrimary: { light: "#1f2937", dark: "#f9fafb" },
    textSecondary: { light: "#6b7280", dark: "#9ca3af" },
  },
  
  // App Groups for sharing data between app and widget
  entitlements: {
    "com.apple.security.application-groups": [
      `group.${config.ios?.bundleIdentifier || "com.focus.quotes"}.widget`
    ],
  },
});

