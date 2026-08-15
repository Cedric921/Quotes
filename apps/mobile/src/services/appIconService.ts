import { Platform } from "react-native";
import { palette } from "../theme/tokens";

/** The Focus mark, black on transparent; tinted per variant. */
export const APP_MARK = require("../../assets/images/source-icon-transparent.png");

export interface AppIconOption {
  id: string;
  /** Bundled preview asset URI, when a rendered preview exists. */
  previewUri?: string;
  /**
   * What the picker draws when no preview file exists: a flat colour or a
   * two-stop gradient, with the mark tinted to read on it. Every variant is
   * the app's own mark on a different ground — the reference app's icons
   * were its quotation mark, and that is what the tiles used to show.
   */
  backdrop: string | readonly [string, string];
  markTint: string;
  isPremium?: boolean;
}

/**
 * Alternate app icons.
 *
 * `id` must match the `name` given to `expo-alternate-app-icons` in
 * `app.config.js`, which is what ends up in the iOS `CFBundleAlternateIcons`
 * map and the Android activity-alias. The PNGs under `assets/icons/` are
 * rendered from the same grounds and tints as the tiles below, so the picker
 * shows what the home screen will get.
 */
export const appIcons: AppIconOption[] = [
  // The icon the app ships with: the mark on white, as `assets/icon.png`.
  { id: "default", backdrop: palette.white, markTint: palette.ink900 },
  {
    id: "galaxy",
    backdrop: [palette.indigo, palette.ink900],
    markTint: palette.white,
  },
  { id: "noir", backdrop: palette.ink800, markTint: palette.slate200 },
  {
    id: "marble",
    backdrop: [palette.slate200, palette.slate300],
    markTint: palette.ink900,
  },
  { id: "light", backdrop: palette.slate200, markTint: palette.ink900 },
  { id: "doNotQuit", backdrop: palette.indigo, markTint: palette.white },
  {
    id: "pastel",
    backdrop: [palette.sky, palette.indigo],
    markTint: palette.ink900,
    isPremium: true,
  },
  {
    id: "chaseYourDreams",
    backdrop: palette.sky,
    markTint: palette.ink900,
    isPremium: true,
  },
  {
    id: "holo",
    backdrop: [palette.mint, palette.indigo],
    markTint: palette.white,
    isPremium: true,
  },
];

/**
 * Swapping the icon is iOS-only for now; on Android it needs an
 * activity-alias dance that also kills the running task, so we no-op rather
 * than restart the app under the user.
 */
export const setAlternateIcon = async (id: string): Promise<void> => {
  if (Platform.OS !== "ios") return;

  // Lazily required so Android bundles never pull the native module in.
  const mod = await import("expo-alternate-app-icons").catch(() => null);
  if (!mod?.setAlternateAppIcon) return;

  await mod.setAlternateAppIcon(id === "default" ? null : id);
};
