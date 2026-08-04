import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { API_CONFIG } from "../../constants/config";
import { getAuthToken } from "../../services/authTokenCache";

/**
 * Password recovery and account deletion.
 *
 * All three endpoints go through `fetch`, not `apiClient`, on purpose: the
 * shared axios client turns any 401 into a global "session expired" logout,
 * and here a 401 only means the six-digit code or the password is wrong.
 * Routing them around the interceptor keeps a typo from signing the user out
 * — or, on the deletion screen, from wiping the session before the account is
 * actually gone.
 */

/** Carries the i18n key the screen should show, not a server string. */
export class AuthError extends Error {
  constructor(readonly messageKey: string) {
    super(messageKey);
    this.name = "AuthError";
  }
}

/** Maps an unknown thrown value to a translatable key. */
export const authErrorKey = (error: unknown): string =>
  error instanceof AuthError ? error.messageKey : "auth.errorOccurred";

const send = async (
  method: "POST" | "DELETE",
  path: string,
  body: unknown,
  status: Record<number, string>,
  token?: string | null,
) => {
  const response = await fetch(`${API_CONFIG.getBaseUrl()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : null),
    },
    body: JSON.stringify(body),
    // The API sleeps on its free tier; a cold start can take half a minute,
    // past which it really is down.
    signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
  });

  if (!response.ok) {
    throw new AuthError(status[response.status] ?? "auth.errorOccurred");
  }
};

/** Sends the six-digit code to the address, in the app's current language. */
export const useForgotPassword = () => {
  const { i18n } = useTranslation();

  return useMutation({
    mutationFn: (email: string) =>
      send(
        "POST",
        "/auth/forgot-password",
        { email: email.trim().toLowerCase(), locale: i18n.language },
        { 429: "auth.tooManyResetRequests" },
      ),
  });
};

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

export const useResetPassword = () =>
  useMutation({
    mutationFn: ({ email, code, newPassword }: ResetPasswordInput) =>
      send(
        "POST",
        "/auth/reset-password",
        { email: email.trim().toLowerCase(), code: code.trim(), newPassword },
        { 401: "auth.invalidResetCode", 404: "auth.invalidResetCode" },
      ),
  });

/**
 * Deletes the account for good. The password re-check is the API's, which is
 * why a wrong one comes back as a 401 and not as a validation error.
 */
export const useDeleteAccount = () =>
  useMutation({
    mutationFn: async (password: string) =>
      send(
        "DELETE",
        "/users/me/account",
        { password },
        { 401: "settings.wrongPassword" },
        await getAuthToken(),
      ),
  });
