import { parse, route } from "@/server/http/route";
import { readUploadRequest } from "@/server/integrations/cloudinary";
import {
  assertUuid,
  findTheme,
  removeTheme,
  updateTheme,
  updateThemeSchema,
} from "@/server/services/themes.service";

export const GET = route({ auth: "admin" }, ({ params }) => findTheme(assertUuid(params.id)));

/** Multipart with an optional new `image`, or plain JSON. */
export const PUT = route({ auth: "admin" }, async ({ req, params }) => {
  const id = assertUuid(params.id);
  const { fields, file } = await readUploadRequest(req);
  return updateTheme(id, parse(updateThemeSchema, fields), file);
});

export const DELETE = route({ auth: "admin" }, ({ params }) => removeTheme(assertUuid(params.id)));
