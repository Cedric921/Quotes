import { route } from "@/server/http/route";
import { sendTestNotification } from "@/server/services/notifications.service";

export const POST = route({ auth: "user" }, ({ ctx }) => sendTestNotification(ctx.userId));
