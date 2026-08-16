import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { env } from "../env";

/**
 * The claims the NestJS API put in its tokens (`@nestjs/jwt`, HS256). Tokens
 * it issued still verify here as long as `JWT_SECRET` holds its secret, so a
 * signed-in user is not logged out by the move.
 */
export interface TokenClaims {
  sub: string;
  email: string;
  isAdmin: boolean;
}

const key = () => new TextEncoder().encode(env().JWT_SECRET);

export async function signToken(claims: TokenClaims): Promise<string> {
  return new SignJWT({ email: claims.email, isAdmin: claims.isAdmin })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(env().JWT_EXPIRATION)
    .sign(key());
}

export async function verifyToken(token: string): Promise<TokenClaims | null> {
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string") return null;
    return {
      sub: payload.sub,
      email: String(payload.email ?? ""),
      isAdmin: payload.isAdmin === true,
    };
  } catch {
    return null;
  }
}

export function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const [scheme, value] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" && value ? value : null;
}
