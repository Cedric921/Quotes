import Toast from "react-native-toast-message";
import i18n from "../../i18n";

/**
 * Auth is the one place in the app that talks back in sentences: every form
 * here can fail for a reason only the server knows. The toast is shared so
 * the five screens report in one voice, and so no screen builds its own.
 */

export const notifyError = (messageKey: string) =>
  Toast.show({
    type: "error",
    text1: i18n.t("common.error"),
    text2: i18n.t(messageKey),
    position: "top",
    visibilityTime: 4000,
  });

export const notifySuccess = (titleKey: string, messageKey?: string) =>
  Toast.show({
    type: "success",
    text1: i18n.t(titleKey),
    text2: messageKey ? i18n.t(messageKey) : undefined,
    position: "top",
    visibilityTime: 3000,
  });

/** Six characters is what the API enforces; the screens mirror it. */
export const MIN_PASSWORD_LENGTH = 6;

/**
 * Shared field checks. They return an i18n key, or `undefined` when the form
 * is good — which is what lets the CTA's disabled state and the submit path
 * use the same rule instead of drifting apart.
 */
export const passwordProblem = (
  password: string,
  confirmation?: string,
): string | undefined => {
  if (password.length < MIN_PASSWORD_LENGTH) return "auth.passwordTooShort";
  if (confirmation !== undefined && password !== confirmation) {
    return "auth.passwordMismatch";
  }
  return undefined;
};

/** Deliberately loose: the server is the authority, this only catches typos. */
export const isEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
