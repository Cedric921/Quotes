import { route } from "@/server/http/route";
import { getUserPushTokens, unregisterAllPushTokens } from "@/server/services/notifications.service";

export const GET = route({ auth: "user" }, ({ ctx }) => getUserPushTokens(ctx.userId));

/** Every token of the account, e.g. on logout. */
export const DELETE = route({ auth: "user" }, async ({ ctx }) => {
  await unregisterAllPushTokens(ctx.userId);
});
