import { z } from "zod";
import { route } from "@/server/http/route";
import { findSocialNetwork, removeSocialNetwork, updateSocialNetwork } from "@/server/services/social.service";

export const GET = route({ auth: "user" }, async ({ params }) => findSocialNetwork(params.id));

export const PUT = route(
  {
    auth: "admin",
    body: z.object({
      name: z.string().optional(),
      url: z.string().optional(),
      icon: z.string().optional(),
      color: z.string().nullish(),
      isActive: z.boolean().optional(),
      order: z.number().optional(),
    }),
  },
  async ({ params, body }) => updateSocialNetwork(params.id, body),
);

export const DELETE = route({ auth: "admin" }, async ({ params }) => {
  await removeSocialNetwork(params.id);
  return { success: true };
});
