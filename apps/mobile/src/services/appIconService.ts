import { Platform } from "react-native";

export interface AppIconOption {
  id: string;
  /** Bundled preview asset URI, or undefined to fall back to a glyph tile. */
  previewUri?: string;
  isPremium?: boolean;
}

/**
 * Alternate app icons.
 *
 * `id` must match the key declared in the iOS `CFBundleAlternateIcons` map and
 * the Android activity-alias name, so this list is the single source of truth
 * for both platforms and the picker.
 */
export const appIcons: AppIconOption[] = [
  { id: "default" },
  { id: "galaxy" },
  { id: "noir" },
  { id: "marble" },
  { id: "light" },
  { id: "doNotQuit" },
  { id: "pastel", isPremium: true },
  { id: "chaseYourDreams", isPremium: true },
  { id: "holo", isPremium: true },
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
