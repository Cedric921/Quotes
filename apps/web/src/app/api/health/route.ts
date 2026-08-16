import { route } from "@/server/http/route";
import { checkHealth } from "@/server/services/health.service";

export const GET = route({ auth: "public" }, async () => checkHealth());
