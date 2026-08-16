import { route } from "@/server/http/route";
import { findDefaultFont } from "@/server/services/fonts.service";

/** Public: the font a fresh install starts with (empty body when there is none). */
export const GET = route({ auth: "public" }, () => findDefaultFont());
