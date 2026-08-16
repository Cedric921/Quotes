import { route } from "@/server/http/route";
import { getStats } from "@/server/services/health.service";

export const GET = route({ auth: "public" }, async () => getStats());
