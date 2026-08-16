import { route } from "@/server/http/route";
import { login } from "@/server/services/auth.service";

/**
 * passport-local: `{ email, password }` in the body, `{ access_token, user }`
 * back (201, as NestJS answered every POST). Missing or wrong credentials are
 * a bare 401, so the body is read by hand rather than validated into a 400.
 */
export const POST = route({ auth: "public" }, async ({ req }) => {
  const body = (await req.json().catch(() => ({}))) as { email?: unknown; password?: unknown } | null;
  return login(body?.email, body?.password);
});
