import { PRIVATE_USER_FIELDS } from "../db/entities";

/**
 * A user as it may leave the server: without the password hash and the reset
 * code, which the NestJS API sent to anyone who asked.
 */
export function publicUser<T extends object>(user: T): Omit<T, (typeof PRIVATE_USER_FIELDS)[number]> {
  const copy = { ...user } as Record<string, unknown>;
  for (const field of PRIVATE_USER_FIELDS) delete copy[field];
  return copy as Omit<T, (typeof PRIVATE_USER_FIELDS)[number]>;
}
