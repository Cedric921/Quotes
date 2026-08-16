import { route } from "@/server/http/route";
import { createFont, createFontSchema, findFonts } from "@/server/services/fonts.service";

// Admin routes: NestJS checked `isAdmin` from the token inline; it is now
// read from the database by the `admin` auth mode.
export const GET = route({ auth: "admin" }, () => findFonts());

export const POST = route({ auth: "admin", body: createFontSchema }, ({ body }) => createFont(body));
