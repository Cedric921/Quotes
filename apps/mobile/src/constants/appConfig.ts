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

/**
 * Where the public site lives: the landing page, the legal pages, and
 * everything the app links out to. One constant, so a custom domain is a
 * one-line change. (The links used to point at focus-app.com, which is not
 * ours — it redirects to a German magazine.)
 */
export const SITE_URL = "https://focus-admin.vercel.app";

export const SUPPORT_URL = "mailto:contact@oderaformations.com";
export const SHARE_APP_URL = SITE_URL;

/** Stamped on every shared image (premium can hide it). The wordmark. */
export const WATERMARK = "Focus";
export const MORE_APPS_URL = SITE_URL;
export const BUNDLE_URL = `${SITE_URL}/#premium`;
/**
 * The legal pages take the language and the platform as query parameters
 * (the store-specific wording differs), so they are built, not stored.
 */
export const legalPageUrl = (
  page: "terms" | "privacy",
  language: string,
  platform: string,
): string => {
  const lang = language.startsWith("en") ? "en" : "fr";
  return `${SITE_URL}/${page}?lang=${lang}&platform=${platform}`;
};

export const SOCIAL_URLS = {
  instagram: "https://instagram.com/focus.app",
  tiktok: "https://tiktok.com/@focus.app",
  facebook: "https://facebook.com/focus.app",
  pinterest: "https://pinterest.com/focusapp",
  x: "https://x.com/focus_app",
} as const;

/**
 * Where the app leaves the quote for the widgets to find.
 *
 * Both sides of the bridge need the exact same string — the app writes it and
 * the headless widget task handler reads it — and a silent drift here shows up
 * as a widget stuck on its fallback line, which is how it spent its first
 * release.
 */
export const WIDGET_QUOTE_KEY = "@focus_widget_quote";
export const WIDGET_QUOTES_ARRAY_KEY = "@focus_widget_quotes_array";

/** Free tier ceiling, mirrored in `likeQuotaSlice`. */
export const FREE_LIKE_QUOTA = 5;

/**
 * Free tier's reminders per day. Mirrors `FREE_MAX_NOTIFICATIONS_PER_DAY` on
 * the API: the stepper stops here for a free account, and says why, instead
 * of letting them schedule twenty and receiving ten.
 */
export const FREE_REMINDERS_PER_DAY = 10;

/** What the stepper allows a premium account. Matches the API's DTO ceiling. */
export const MAX_REMINDERS_PER_DAY = 20;

/** Length of the introductory trial, in days. */
export const TRIAL_DAYS = 3;
