import { route } from "@/server/http/route";
import { resetNotificationSettings } from "@/server/services/users.service";

export const POST = route({ auth: "user" }, async ({ ctx }) => resetNotificationSettings(ctx.userId));
