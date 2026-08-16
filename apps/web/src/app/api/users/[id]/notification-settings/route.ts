import { route } from "@/server/http/route";
import {
  getNotificationSettings,
  notificationSettingsBody,
  updateNotificationSettings,
} from "@/server/services/users.service";

// Another user's settings, for the admin.

export const GET = route({ auth: "admin" }, async ({ params }) => getNotificationSettings(params.id));

export const PUT = route({ auth: "admin", body: notificationSettingsBody }, async ({ params, body }) =>
  updateNotificationSettings(params.id, body),
);
