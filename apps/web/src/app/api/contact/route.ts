import { z } from "zod";
import { route } from "@/server/http/route";
import { createContactMessage, findAllContactMessages } from "@/server/services/contact.service";

/** Public: anyone can send a message. Only the four fields are read (NestJS spread the body). */
export const POST = route(
  {
    auth: "public",
    body: z.object({ name: z.string(), email: z.string(), subject: z.string(), message: z.string() }),
  },
  async ({ body }) => createContactMessage(body),
);

/** NestJS answered a non-admin with a 200 `{ error: "Unauthorized" }`; now a 403. */
export const GET = route({ auth: "admin" }, async () => findAllContactMessages());
