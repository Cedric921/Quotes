import { route } from "@/server/http/route";
import { deleteAccount } from "@/server/services/users.service";

/**
 * `{ password }` in the DELETE body. Read by hand so a missing body is the
 * same "Password is required" 400 NestJS gave, not a JSON error.
 */
export const DELETE = route({ auth: "user" }, async ({ req, ctx }) => {
  const body = (await req.json().catch(() => ({}))) as { password?: unknown } | null;
  await deleteAccount(ctx.userId, body?.password);
  return { message: "Account deleted successfully" };
});
