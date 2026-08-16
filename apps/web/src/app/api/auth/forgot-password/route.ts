import { z } from "zod";
import { route } from "@/server/http/route";
import { forgotPassword } from "@/server/services/auth.service";

export const POST = route(
  { auth: "public", body: z.object({ email: z.string().optional(), locale: z.string().nullish() }) },
  async ({ body }) => forgotPassword(body.email, body.locale),
);
