import { z } from "zod";
import { requireAdmin } from "@/server/auth/context";
import { route } from "@/server/http/route";
import { findUser, removeUser, updateUser } from "@/server/services/users.service";

/**
 * Public in NestJS. The app reads its own account here with its token (the
 * subscription sync, the profile), the admin reads anyone's: a signed-in
 * user may read their own id, any other id takes an admin.
 */
export const GET = route({ auth: "user" }, async ({ req, params, ctx }) => {
  if (params.id !== ctx.userId) await requireAdmin(req);
  return findUser(params.id);
});

/** Admin edit — the admin panel sets `isAdmin` and `isSubscribed` through it. Public in NestJS. */
export const PATCH = route(
  {
    auth: "admin",
    body: z.object({
      email: z.string().optional(),
      password: z.string().optional(),
      name: z.string().nullish(),
      avatar: z.string().nullish(),
      isAdmin: z.boolean().optional(),
      isSubscribed: z.boolean().optional(),
      subscriptionEndDate: z.string().nullish(),
      usedPromoCode: z.string().nullish(),
    }),
  },
  async ({ params, body }) => updateUser(params.id, body),
);

/** Public in NestJS. */
export const DELETE = route({ auth: "admin" }, async ({ params }) => removeUser(params.id));
