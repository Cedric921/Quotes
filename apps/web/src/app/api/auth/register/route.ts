import { z } from "zod";
import { route } from "@/server/http/route";
import { createUser } from "@/server/services/users.service";

/**
 * Only email, password and name are read: NestJS spread the whole body into
 * the new user, so a request could register itself as an admin or premium.
 */
export const POST = route(
  {
    auth: "public",
    body: z.object({
      email: z.string(),
      password: z.string().optional(),
      name: z.string().nullish(),
    }),
  },
  async ({ body }) => createUser({ email: body.email, password: body.password, name: body.name }),
);
