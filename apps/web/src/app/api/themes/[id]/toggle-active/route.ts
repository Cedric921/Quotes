import { route } from "@/server/http/route";
import { assertUuid, toggleThemeActive } from "@/server/services/themes.service";

export const POST = route({ auth: "admin" }, ({ params }) => toggleThemeActive(assertUuid(params.id)));
