import { route } from "@/server/http/route";
import { unregisterPushToken } from "@/server/services/notifications.service";

/** The mobile app sends the token URI-encoded (`ExponentPushToken[...]`). */
function decode(token: string): string {
  if (!token.includes("%")) return token;
  try {
    return decodeURIComponent(token);
  } catch {
    return token;
  }
}

export const DELETE = route({ auth: "user" }, async ({ ctx, params }) => {
  await unregisterPushToken(ctx.userId, decode(params.token));
});
