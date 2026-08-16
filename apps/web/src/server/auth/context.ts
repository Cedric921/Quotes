import "server-only";
import { repo } from "../db";
import { User } from "../db/entities";
import { forbidden, unauthorized } from "../http/errors";
import { bearerToken, verifyToken } from "./jwt";

/** What the NestJS guards put on `req.user`. */
export interface AuthContext {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export async function optionalAuth(req: Request): Promise<AuthContext | null> {
  const token = bearerToken(req);
  if (!token) return null;
  const claims = await verifyToken(token);
  return claims ? { userId: claims.sub, email: claims.email, isAdmin: claims.isAdmin } : null;
}

export async function requireUser(req: Request): Promise<AuthContext> {
  const ctx = await optionalAuth(req);
  if (!ctx) throw unauthorized();
  return ctx;
}

/**
 * The token's `isAdmin` is only where an admin check starts: it is read again
 * from the database, so taking the role away takes effect at once instead of
 * when the seven-day token expires.
 */
export async function requireAdmin(req: Request): Promise<AuthContext> {
  const ctx = await requireUser(req);
  const user = await (await repo(User)).findOne({ where: { id: ctx.userId }, select: ["id", "isAdmin"] });
  if (!user?.isAdmin) throw forbidden("Admin access required");
  return { ...ctx, isAdmin: true };
}
