import { z } from "zod";
import { route } from "@/server/http/route";
import { reorderThemes } from "@/server/services/themes.service";

export const POST = route(
  { auth: "admin", body: z.object({ themeIds: z.array(z.string()) }) },
  ({ body }) => reorderThemes(body.themeIds),
);
