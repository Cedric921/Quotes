import { useAppSelector } from "../../store/hooks";

/**
 * The name to call the user by, wherever it came from.
 *
 * Three places hold one: the funnel (everyone), the settings store (anyone who
 * edited it), and the API user (only people with an account). The local value
 * wins — it is the one the user last typed on this device — and the account
 * name is the fallback for a fresh install signed into an existing account.
 */
export function useDisplayName(): string {
  const stored = useAppSelector((s) => s.settings.name);
  const funnel = useAppSelector((s) => s.onboarding.firstName);
  const account = useAppSelector((s) => s.auth.user?.name);

  return (stored || funnel || account || "").trim();
}
