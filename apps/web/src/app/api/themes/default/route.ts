import { route } from "@/server/http/route";
import { findDefaultTheme } from "@/server/services/themes.service";

/** Public: the theme a fresh install starts with (empty body when there is none). */
export const GET = route({ auth: "public" }, () => findDefaultTheme());
