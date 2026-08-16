import { z } from "zod";
import { route } from "@/server/http/route";
import { updateProfile } from "@/server/services/users.service";

export const PATCH = route(
  { auth: "user", body: z.object({ name: z.string().nullish(), avatar: z.string().nullish() }) },
  async ({ ctx, body }) => updateProfile(ctx.userId, body),
);
