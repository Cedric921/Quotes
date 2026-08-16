import { z } from "zod";
import { route } from "@/server/http/route";
import { getConfig, updateConfig } from "@/server/services/plans.service";

export const GET = route({ auth: "public" }, () => getConfig());

// Only `freemiumDurationDays` was ever persisted; the other UpdateConfigDto
// fields are accepted and ignored, as in NestJS.
export const PUT = route(
  { auth: "admin", body: z.object({ freemiumDurationDays: z.union([z.number(), z.string()]).optional() }) },
  ({ body }) => updateConfig(body),
);
