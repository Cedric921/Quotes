import { z } from "zod";
import { route } from "@/server/http/route";
import { sendAnnouncementToPremiumUsers } from "@/server/services/notifications.service";

export const maxDuration = 60;

// NestJS typed title and body as required but never validated them; they
// stay optional so nothing that worked before is refused.
const body = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const POST = route({ auth: "admin", body }, ({ body }) =>
  sendAnnouncementToPremiumUsers(body.title, body.body, body.data),
);
