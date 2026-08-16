import { route } from "@/server/http/route";
import { findActiveFonts } from "@/server/services/fonts.service";

/** Public: the mobile app's font picker. */
export const GET = route({ auth: "public" }, () => findActiveFonts());
