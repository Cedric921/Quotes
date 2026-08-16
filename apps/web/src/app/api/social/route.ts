import { z } from "zod";
import { route } from "@/server/http/route";
import { createSocialNetwork, findActiveSocialNetworks, findAllSocialNetworks } from "@/server/services/social.service";

/** Signed in: an admin gets every network, anyone else the active ones (as in NestJS). */
export const GET = route({ auth: "user" }, async ({ ctx }) =>
  ctx.isAdmin ? findAllSocialNetworks() : findActiveSocialNetworks(),
);

/** Admin only (NestJS answered a non-admin with a 200 `{ error: "Unauthorized" }`). */
export const POST = route(
  {
    auth: "admin",
    body: z.object({
      name: z.string(),
      url: z.string(),
      icon: z.string(),
      color: z.string().nullish(),
      isActive: z.boolean().optional(),
      order: z.number().optional(),
    }),
  },
  async ({ body }) => createSocialNetwork(body),
);
