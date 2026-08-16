import { z } from "zod";
import { route } from "@/server/http/route";
import { registerPushToken } from "@/server/services/notifications.service";

// NestJS's DTO asked for `platform` in ios|android but never enforced it (no
// ValidationPipe), so any string is accepted here too.
const body = z.object({
  token: z.string().min(1),
  deviceId: z.string().nullish(),
  platform: z.string().nullish(),
});

export const POST = route({ auth: "user", body }, ({ ctx, body }) => registerPushToken(ctx.userId, body));
