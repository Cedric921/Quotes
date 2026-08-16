import { z } from "zod";
import { route } from "@/server/http/route";
import { unavailable } from "@/server/http/errors";
import { translate } from "@/server/services/translations.service";

/** Public: the app's translation service calls it without a token. */
export const POST = route(
  {
    auth: "public",
    body: z.object({ text: z.string(), targetLang: z.string(), sourceLang: z.string().nullish() }),
  },
  async ({ body }) => {
    const sourceLang = body.sourceLang || "EN";
    try {
      const translatedText = await translate(body.text, body.targetLang, sourceLang);
      return { translatedText, sourceLang, targetLang: body.targetLang };
    } catch (error) {
      throw unavailable((error as Error).message || "Translation failed");
    }
  },
);
