import type { User } from "../db/entities";

/**
 * Premium is a flag and a date: an account whose end date has passed is no
 * longer premium, whatever the flag says. The midnight job that used to clear
 * the flag is not needed for correctness — every check goes through here.
 */
export function isPremium(user: Pick<User, "isSubscribed" | "subscriptionEndDate">): boolean {
  if (!user.isSubscribed || !user.subscriptionEndDate) return false;
  return new Date(user.subscriptionEndDate) > new Date();
}
