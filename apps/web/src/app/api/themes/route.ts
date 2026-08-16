import { parse, route } from "@/server/http/route";
import { readUploadRequest } from "@/server/integrations/cloudinary";
import { createTheme, createThemeSchema, findThemes } from "@/server/services/themes.service";

// Admin routes: NestJS checked `isAdmin` from the token inline; it is now
// read from the database by the `admin` auth mode.
export const GET = route({ auth: "admin" }, () => findThemes());

/**
 * Multipart form (field `image` plus text fields), as the admin sends it.
 * The image is required: NestJS answered "No file provided" without one.
 * Vercel caps request bodies at ~4.5 MB, so the effective limit is below the
 * 5 MB enforced here — see the TODO on `uploadImage` about direct uploads.
 */
export const POST = route({ auth: "admin" }, async ({ req }) => {
  const { fields, file } = await readUploadRequest(req);
  return createTheme(parse(createThemeSchema, fields), file);
});
