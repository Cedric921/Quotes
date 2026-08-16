import { route } from "@/server/http/route";
import { getSupportedLanguages } from "@/server/services/translations.service";

export const GET = route({ auth: "public" }, async () => getSupportedLanguages());
