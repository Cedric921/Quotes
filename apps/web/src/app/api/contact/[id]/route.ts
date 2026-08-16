import { z } from "zod";
import { route } from "@/server/http/route";
import { ContactMessageStatus } from "@/server/db/entities";
import {
  findContactMessage,
  markContactMessageAsRead,
  removeContactMessage,
  updateContactMessage,
} from "@/server/services/contact.service";

/** Viewing a message marks it as read. */
export const GET = route({ auth: "admin" }, async ({ params }) => {
  await markContactMessageAsRead(params.id);
  return findContactMessage(params.id);
});

export const PUT = route(
  { auth: "admin", body: z.object({ status: z.enum(ContactMessageStatus).optional() }) },
  async ({ params, body }) => updateContactMessage(params.id, body),
);

export const DELETE = route({ auth: "admin" }, async ({ params }) => {
  await removeContactMessage(params.id);
  return { success: true };
});
