import { route } from "@/server/http/route";
import { assertUuid, toggleFontActive } from "@/server/services/fonts.service";

export const POST = route({ auth: "admin" }, ({ params }) => toggleFontActive(assertUuid(params.id)));
