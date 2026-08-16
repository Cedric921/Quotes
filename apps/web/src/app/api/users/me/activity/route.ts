import { z } from "zod";
import { route } from "@/server/http/route";
import { getUserActivity, trackActivity } from "@/server/services/users.service";

/** Body: `{ date: "YYYY-MM-DD" }`, the user's local day. */
export const POST = route({ auth: "user", body: z.object({ date: z.string() }) }, async ({ ctx, body }) =>
  trackActivity(ctx.userId, body.date),
);

export const GET = route(
  { auth: "user", query: z.object({ startDate: z.string().optional(), endDate: z.string().optional() }) },
  async ({ ctx, query }) => getUserActivity(ctx.userId, query.startDate, query.endDate),
);
