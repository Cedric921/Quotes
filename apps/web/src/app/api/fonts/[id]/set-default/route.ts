import { route } from "@/server/http/route";
import { assertUuid, setDefaultFont } from "@/server/services/fonts.service";

export const POST = route({ auth: "admin" }, ({ params }) => setDefaultFont(assertUuid(params.id)));
