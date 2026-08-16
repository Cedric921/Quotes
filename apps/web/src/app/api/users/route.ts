import { z } from "zod";
import { route } from "@/server/http/route";
import { createUser, findAllUsers } from "@/server/services/users.service";

// Both were public in NestJS: anyone could list every account (password
// hashes included) or create an admin. Admin-only now.

export const GET = route({ auth: "admin" }, async () => findAllUsers());

export const POST = route(
  {
    auth: "admin",
    body: z.object({
      email: z.string(),
      password: z.string().optional(),
      name: z.string().nullish(),
      isAdmin: z.boolean().optional(),
    }),
  },
  async ({ body }) => createUser(body),
);
