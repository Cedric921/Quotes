import "server-only";
import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { IsNull, LessThan } from "typeorm";
import { signToken } from "../auth/jwt";
import { repo } from "../db";
import { User } from "../db/entities";
import { sendPasswordResetCode } from "../integrations/mail";
import { badRequest, unauthorized } from "../http/errors";
import { findUser, findUserByEmailWithPassword } from "./users.service";

const RESET_CODE_TTL_MS = 15 * 60 * 1000;

/**
 * One reset code per account per minute.
 *
 * NestJS allowed three requests per quarter hour per address, counted in an
 * in-memory Map — which does not hold across serverless instances. Without a
 * table for it, the limit is read off the account itself: a request is
 * refused while the current code was issued less than a minute ago, i.e.
 * while `passwordResetExpires` is still more than TTL - 60 s away.
 *
 * A request inside the minute gets the same `{ success: true }` as any
 * other, without a new e-mail: the code sent a moment ago stays valid, and
 * the answer does not reveal whether the address has an account.
 */
const RESET_MIN_INTERVAL_MS = 60 * 1000;

/**
 * passport-local, by hand: email + password from the body, exact email match,
 * bcrypt comparison. Any failure is a bare 401, as the guard answered.
 */
export async function login(email: unknown, password: unknown) {
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    throw unauthorized();
  }
  const user = await findUserByEmailWithPassword(email);
  if (!user?.password || !(await bcrypt.compare(password, user.password))) throw unauthorized();

  const access_token = await signToken({ sub: user.id, email: user.email, isAdmin: user.isAdmin });
  return { access_token, user: await findUser(user.id) };
}

export async function verifyPassword(userId: string, password: unknown): Promise<boolean> {
  if (typeof password !== "string" || !password) return false;
  const user = await (await repo(User)).findOne({ where: { id: userId }, select: ["id", "password"] });
  if (!user?.password) return false;
  return bcrypt.compare(password, user.password);
}

export async function forgotPassword(email: string | undefined, locale?: string | null): Promise<{ success: true }> {
  if (!email) throw badRequest("Email is required");

  const normalizedEmail = email.trim().toLowerCase();
  const users = await repo(User);
  const user = await users.findOne({
    where: { email: normalizedEmail },
    select: ["id", "email", "name", "password"],
  });

  // Always respond with success to avoid leaking whether the email exists
  if (!user || !user.password) return { success: true };

  // `Math.random` is predictable; a guessable reset code is a password given away.
  const code = String(randomInt(100000, 1000000));
  const hashedCode = await bcrypt.hash(code, 10);
  const now = Date.now();

  // The rate limit and the write in one conditional UPDATE, so two requests
  // racing each other cannot both get through. A code still valid for more
  // than TTL - 60 s was issued less than a minute ago.
  const result = await users.update(
    [
      { id: user.id, passwordResetExpires: IsNull() },
      { id: user.id, passwordResetExpires: LessThan(new Date(now + RESET_CODE_TTL_MS - RESET_MIN_INTERVAL_MS)) },
    ],
    { passwordResetCode: hashedCode, passwordResetExpires: new Date(now + RESET_CODE_TTL_MS) },
  );
  // A refusal would answer differently for an existing account than for an
  // unknown address, and so reveal which one it is. The answer stays the same;
  // only the e-mail is not sent again within the minute.
  if (!result.affected) return { success: true };

  try {
    sendPasswordResetCode(user.email, code, user.name, locale);
  } catch {
    // swallow — still return success to keep the response uniform
  }
  return { success: true };
}

export async function resetPassword(
  email: string | undefined,
  code: string | undefined,
  newPassword: string | undefined,
): Promise<{ success: true }> {
  if (!email || !code || !newPassword) throw badRequest("Email, code and new password are required");
  if (newPassword.length < 6) throw badRequest("Password must be at least 6 characters long");

  const normalizedEmail = email.trim().toLowerCase();
  const users = await repo(User);
  const user = await users.findOne({
    where: { email: normalizedEmail },
    select: ["id", "passwordResetCode", "passwordResetExpires"],
  });

  if (
    !user ||
    !user.passwordResetCode ||
    !user.passwordResetExpires ||
    new Date(user.passwordResetExpires).getTime() < Date.now()
  ) {
    throw unauthorized("Invalid or expired reset code");
  }

  if (!(await bcrypt.compare(code, user.passwordResetCode))) {
    throw unauthorized("Invalid or expired reset code");
  }

  // `update` rather than `save`: the entity loaded here is partial, and
  // writing it back whole could erase what it does not carry.
  await users.update(user.id, {
    password: await bcrypt.hash(newPassword, 10),
    passwordResetCode: null,
    passwordResetExpires: null,
  });
  return { success: true };
}
