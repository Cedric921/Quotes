import { route } from "@/server/http/route";
import {
  getNotificationSettings,
  notificationSettingsBody,
  updateNotificationSettings,
} from "@/server/services/users.service";

export const GET = route({ auth: "user" }, async ({ ctx }) => getNotificationSettings(ctx.userId));

export const PUT = route({ auth: "user", body: notificationSettingsBody }, async ({ ctx, body }) =>
  updateNotificationSettings(ctx.userId, body),
);
