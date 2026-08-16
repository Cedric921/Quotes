import { z } from "zod";
import { route } from "@/server/http/route";
import { reorderFonts } from "@/server/services/fonts.service";

export const POST = route(
  { auth: "admin", body: z.object({ fontIds: z.array(z.string()) }) },
  ({ body }) => reorderFonts(body.fontIds),
);
