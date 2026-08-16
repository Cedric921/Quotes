import { z } from "zod";
import { route } from "@/server/http/route";
import { getActivityStats } from "@/server/services/users.service";

/** `?year=&month=` (1-12), the current month when left out. */
export const GET = route(
  { auth: "user", query: z.object({ year: z.string().optional(), month: z.string().optional() }) },
  async ({ ctx, query }) => {
    const now = new Date();
    const year = query.year ? Number.parseInt(query.year, 10) : now.getFullYear();
    const month = query.month ? Number.parseInt(query.month, 10) : now.getMonth() + 1;
    return getActivityStats(ctx.userId, year, month);
  },
);
