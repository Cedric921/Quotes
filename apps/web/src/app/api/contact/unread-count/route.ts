import { route } from "@/server/http/route";
import { getUnreadContactCount } from "@/server/services/contact.service";

/** NestJS answered a non-admin with `{ count: 0 }`; now a 403. */
export const GET = route({ auth: "admin" }, async () => ({ count: await getUnreadContactCount() }));
