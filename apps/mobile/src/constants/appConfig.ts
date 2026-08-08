import Constants from "expo-constants";

/**
 * Static URLs and app metadata for the v2 UI.
 *
 * Kept apart from `config.ts` (which holds API base URLs and runtime env) so
 * that anything a designer or a marketer might ask to change lives in one
 * obvious file.
 */

export const APP_VERSION: string =
  (Constants.expoConfig?.version as string | undefined) ?? "2.0.0";

export const SUPPORT_URL = "https://focus-app.com/help";
export const SHARE_APP_URL = "https://focus-app.com";

/**
 * Stamped on every shared image (premium can hide it). Written without the
 * scheme because it is read, not tapped.
 */
export const WATERMARK = "focus-app.com";
export const MORE_APPS_URL = "https://focus-app.com/apps";
export const BUNDLE_URL = "https://focus-app.com/bundle";
export const LEGAL_TERMS_URL = "https://focus-app.com/terms";
export const LEGAL_PRIVACY_URL = "https://focus-app.com/privacy";

export const SOCIAL_URLS = {
  instagram: "https://instagram.com/focus.app",
  tiktok: "https://tiktok.com/@focus.app",
  facebook: "https://facebook.com/focus.app",
  pinterest: "https://pinterest.com/focusapp",
  x: "https://x.com/focus_app",
} as const;

/** Free tier ceiling, mirrored in `likeQuotaSlice`. */
export const FREE_LIKE_QUOTA = 5;

/** Length of the introductory trial, in days. */
export const TRIAL_DAYS = 3;
