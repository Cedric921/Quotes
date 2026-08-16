import { route } from "@/server/http/route";
import { findActiveThemes } from "@/server/services/themes.service";

/** Public: the mobile app's theme picker. */
export const GET = route({ auth: "public" }, () => findActiveThemes());
