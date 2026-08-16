import { route } from "@/server/http/route";
import { ping } from "@/server/services/health.service";

export const GET = route({ auth: "public" }, async () => ping());
