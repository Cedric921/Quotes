import { z } from "zod";
import { parse, route } from "@/server/http/route";
import { REMINDER_SLOTS, sendPremiumReminder, type ReminderSlot } from "@/server/services/notifications.service";
import { assertCronAuthorized } from "../_auth";

export const maxDuration = 60;

/**
 * The premium reminders NestJS sent at 08:00, 12:30 and 19:00 UTC, each slot
 * with its own message. Vercel Hobby runs crons once a day at most, so the
 * GitHub Actions workflow `.github/workflows/focus-cron.yml` calls this with
 * `?slot=morning|noon|evening`.
 */
const query = z.object({
  slot: z.enum(Object.keys(REMINDER_SLOTS) as [ReminderSlot, ...ReminderSlot[]]),
});

const handler = route({ auth: "public" }, async ({ req }) => {
  // The secret first, so an unauthenticated caller learns nothing else.
  assertCronAuthorized(req);
  const { slot } = parse(query, Object.fromEntries(req.nextUrl.searchParams));
  // 200 for POST too: it triggers a job, it creates nothing.
  return Response.json(await sendPremiumReminder(slot));
});

export const GET = handler;
export const POST = handler;
