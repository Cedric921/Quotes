import "server-only";
import { repo } from "../db";
import { ContactMessage, ContactMessageStatus } from "../db/entities";
import { notFound } from "../http/errors";

export interface CreateContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * NestJS read `req.user?.id` here, but the route had no guard, so the
 * message was always stored without a user: kept as is.
 */
export async function createContactMessage(input: CreateContactMessageInput, userId?: string | null) {
  const messages = await repo(ContactMessage);
  const message = messages.create({
    name: input.name,
    email: input.email,
    subject: input.subject,
    message: input.message,
    userId: userId ?? null,
    status: ContactMessageStatus.UNREAD,
  });
  return messages.save(message);
}

export async function findAllContactMessages() {
  return (await repo(ContactMessage)).find({ order: { createdAt: "DESC" } });
}

export async function findContactMessage(id: string) {
  const message = await (await repo(ContactMessage)).findOne({ where: { id } });
  if (!message) throw notFound(`Contact message with ID ${id} not found`);
  return message;
}

export async function updateContactMessage(id: string, input: { status?: ContactMessageStatus }) {
  const message = await findContactMessage(id);
  if (input.status !== undefined) message.status = input.status;
  return (await repo(ContactMessage)).save(message);
}

export const markContactMessageAsRead = (id: string) => updateContactMessage(id, { status: ContactMessageStatus.READ });
export const markContactMessageAsUnread = (id: string) =>
  updateContactMessage(id, { status: ContactMessageStatus.UNREAD });

export async function removeContactMessage(id: string): Promise<void> {
  const message = await findContactMessage(id);
  await (await repo(ContactMessage)).softDelete(message.id);
}

export async function getUnreadContactCount(): Promise<number> {
  return (await repo(ContactMessage)).count({ where: { status: ContactMessageStatus.UNREAD } });
}
