import { route } from "@/server/http/route";
import { assertUuid, findFont, removeFont, updateFont, updateFontSchema } from "@/server/services/fonts.service";

export const GET = route({ auth: "admin" }, ({ params }) => findFont(assertUuid(params.id)));

export const PUT = route({ auth: "admin", body: updateFontSchema }, ({ params, body }) =>
  updateFont(assertUuid(params.id), body),
);

export const DELETE = route({ auth: "admin" }, async ({ params }) => {
  await removeFont(assertUuid(params.id));
  return { message: "Font deleted successfully" };
});
