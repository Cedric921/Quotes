import { z } from "zod";
import { route } from "@/server/http/route";
import { resetPassword } from "@/server/services/auth.service";

export const POST = route(
  {
    auth: "public",
    body: z.object({
      email: z.string().optional(),
      code: z.string().optional(),
      newPassword: z.string().optional(),
    }),
  },
  async ({ body }) => resetPassword(body.email, body.code, body.newPassword),
);
