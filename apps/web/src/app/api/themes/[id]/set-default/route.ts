import { route } from "@/server/http/route";
import { assertUuid, setDefaultTheme } from "@/server/services/themes.service";

export const POST = route({ auth: "admin" }, ({ params }) => setDefaultTheme(assertUuid(params.id)));
