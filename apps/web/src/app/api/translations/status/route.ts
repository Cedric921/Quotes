import { route } from "@/server/http/route";
import { getSupportedLanguages, isTranslationAvailable } from "@/server/services/translations.service";

export const GET = route({ auth: "public" }, async () => ({
  available: isTranslationAvailable(),
  supportedLanguages: getSupportedLanguages(),
}));
