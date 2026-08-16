import { z } from "zod";
import { route } from "@/server/http/route";
import { unauthorized } from "@/server/http/errors";
import { verifyPassword } from "@/server/services/auth.service";

export const POST = route(
  { auth: "user", body: z.object({ password: z.unknown().optional() }) },
  async ({ ctx, body }) => {
    if (!(await verifyPassword(ctx.userId, body.password))) throw unauthorized("Invalid password");
    return { success: true };
  },
);
