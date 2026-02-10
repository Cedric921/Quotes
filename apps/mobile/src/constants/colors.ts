export interface ThemeColors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;

  // UI colors
  primary: string;
  accent: string;
  error: string;
  success: string;
  warning: string;

  // Border & Divider
  border: string;
  divider: string;

  // Card & Surface
  card: string;
  surface: string;

  // Special
  shadow: string;
  overlay: string;
}

export const lightColors: ThemeColors = {
  background: "#FFFFFF",
  backgroundSecondary: "#F5F5F7",
  backgroundTertiary: "#E5E5EA",

  text: "#000000",
  textSecondary: "#3C3C43",
  textTertiary: "#8E8E93",

  primary: "#007AFF",
  accent: "#5856D6",
  error: "#FF3B30",
  success: "#34C759",
  warning: "#FF9500",

  border: "#C6C6C8",
  divider: "#E5E5EA",

  card: "#FFFFFF",
  surface: "#F5F5F7",

  shadow: "#000000",
  overlay: "rgba(0, 0, 0, 0.4)",
};

export const darkColors: ThemeColors = {
  background: "#000000",
  backgroundSecondary: "#1C1C1E",
  backgroundTertiary: "#2C2C2E",

  text: "#FFFFFF",
  textSecondary: "#EBEBF5",
  textTertiary: "#8E8E93",

  primary: "#0A84FF",
  accent: "#5E5CE6",
  error: "#FF453A",
  success: "#32D74B",
  warning: "#FF9F0A",

  border: "#38383A",
  divider: "#2C2C2E",

  card: "#1C1C1E",
  surface: "#2C2C2E",

  shadow: "#000000",
  overlay: "rgba(0, 0, 0, 0.6)",
};

