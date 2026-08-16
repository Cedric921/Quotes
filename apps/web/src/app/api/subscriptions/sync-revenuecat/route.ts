import { z } from "zod";
import { route } from "@/server/http/route";
import { syncRevenueCatEntitlements } from "@/server/services/revenuecat.service";

// `entitlements` is required: without it NestJS threw on `.includes` (500).
const body = z.object({ revenueCatUserId: z.string().nullish(), entitlements: z.array(z.string()) });

export const POST = route({ auth: "user", body }, ({ ctx, body }) =>
  syncRevenueCatEntitlements(ctx.userId, body.revenueCatUserId ?? undefined, body.entitlements),
);
