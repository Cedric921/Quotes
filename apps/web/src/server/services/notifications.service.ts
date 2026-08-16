import "server-only";
import { In } from "typeorm";
import { repo } from "../db";
import { PushToken, Quote, User } from "../db/entities";
import { sendPushNotifications } from "../integrations/expo-push";
import { isPremium } from "./premium";

/**
 * Push tokens, the admin sends and the scheduled premium notifications —
 * NestJS's `NotificationsService` and `PremiumNotificationCronService`.
 *
 * Not ported: the per-minute job that sent each user random quotes inside
 * their notification window (`handleScheduledNotifications` and its
 * `dailyNotificationTracker`). The mobile app schedules those reminders
 * locally on the device now.
 */

// ==================== PUSH TOKENS ====================

export interface RegisterPushTokenInput {
  token: string;
  deviceId?: string | null;
  platform?: string | null;
}

export async function registerPushToken(userId: string, dto: RegisterPushTokenInput): Promise<PushToken> {
  const tokens = await repo(PushToken);
  let pushToken = await tokens.findOne({ where: { token: dto.token } });

  if (pushToken) {
    // The token may come from another account on the same device (logout,
    // then login as someone else): it now belongs to this user.
    pushToken.userId = userId;
    if (dto.deviceId) pushToken.deviceId = dto.deviceId;
    if (dto.platform) pushToken.platform = dto.platform;
    pushToken.isActive = true;
  } else {
    pushToken = tokens.create({
      userId,
      token: dto.token,
      deviceId: dto.deviceId ?? null,
      platform: dto.platform ?? null,
      isActive: true,
    });
  }

  return tokens.save(pushToken);
}

export async function unregisterPushToken(userId: string, token: string): Promise<void> {
  await (await repo(PushToken)).delete({ userId, token });
}

/** Every token of the account, e.g. on logout. */
export async function unregisterAllPushTokens(userId: string): Promise<void> {
  await (await repo(PushToken)).delete({ userId });
}

export async function getUserPushTokens(userId: string): Promise<PushToken[]> {
  return (await repo(PushToken)).find({ where: { userId, isActive: true } });
}

// ==================== HELPERS ====================

function truncate(text: string, max: number): string {
  return text.length > max ? text.substring(0, max - 3) + "..." : text;
}

async function getRandomQuote(): Promise<Quote | null> {
  const quotes = await (await repo(Quote))
    .createQueryBuilder("quote")
    .leftJoinAndSelect("quote.topic", "topic")
    .orderBy("RANDOM()")
    .limit(1)
    .getMany();
  return quotes[0] ?? null;
}

async function getRandomPremiumQuote(): Promise<Quote | null> {
  const quotes = await (await repo(Quote))
    .createQueryBuilder("quote")
    .leftJoinAndSelect("quote.topic", "topic")
    .where("topic.isPremium = :isPremium", { isPremium: true })
    .orderBy("RANDOM()")
    .limit(1)
    .getMany();
  return quotes[0] ?? null;
}

/** The active push tokens of every account with a running subscription. */
async function getPremiumUserTokens(): Promise<string[]> {
  const subscribed = await (await repo(User)).find({
    where: { isSubscribed: true },
    select: ["id", "isSubscribed", "subscriptionEndDate"],
  });
  const userIds = subscribed.filter(isPremium).map((user) => user.id);
  if (userIds.length === 0) return [];

  const pushTokens = await (await repo(PushToken)).find({
    where: { userId: In(userIds), isActive: true },
    select: ["id", "token"],
  });
  return pushTokens.map((pt) => pt.token);
}

// ==================== USER ====================

export async function sendTestNotification(userId: string): Promise<{ sent: number }> {
  const pushTokens = await getUserPushTokens(userId);
  if (pushTokens.length === 0) return { sent: 0 };

  const quote = await getRandomQuote();
  const tokens = pushTokens.map((pt) => pt.token);

  await sendPushNotifications(
    tokens,
    "Focus",
    quote ? truncate(quote.text, 100) : "Vos notifications fonctionnent parfaitement !",
    quote ? { quoteId: quote.id, author: quote.author } : undefined,
  );

  return { sent: tokens.length };
}

// ==================== SCHEDULED: REMINDERS ====================

// Reminder messages for premium users, as NestJS sent them.
const REMINDER_MESSAGES = [
  { title: "Focus", body: "Découvrez votre citation inspirante du jour !" },
  { title: "Focus", body: "Prenez une pause et laissez-vous inspirer par nos citations premium." },
  { title: "Focus", body: "De nouvelles citations premium vous attendent." },
  { title: "Focus", body: "N'oubliez pas votre dose d'inspiration du jour !" },
  { title: "Focus", body: "Votre dose quotidienne de motivation est prête." },
] as const;

/**
 * The three daily reminder slots. NestJS ran them at 08:00, 12:30 and 19:00
 * (server time, UTC), each with its own message: index 0, 1 and 2.
 */
export const REMINDER_SLOTS = { morning: 0, noon: 1, evening: 2 } as const;
export type ReminderSlot = keyof typeof REMINDER_SLOTS;

export async function sendPremiumReminder(slot: ReminderSlot): Promise<{ slot: ReminderSlot; sent: number }> {
  const tokens = await getPremiumUserTokens();
  if (tokens.length === 0) {
    console.log("[notifications] No premium users to notify");
    return { slot, sent: 0 };
  }

  const message = REMINDER_MESSAGES[REMINDER_SLOTS[slot] % REMINDER_MESSAGES.length];
  await sendPushNotifications(tokens, message.title, message.body, { type: "reminder" });

  console.log(`[notifications] ${slot} reminder sent to ${tokens.length} premium tokens`);
  return { slot, sent: tokens.length };
}

// ==================== SCHEDULED: DAILY PREMIUM QUOTE ====================

/** A random premium quote to every premium user (NestJS: 15:00 daily). */
export async function sendDailyPremiumQuote(): Promise<{ sent: number; quoteId: string | null }> {
  const tokens = await getPremiumUserTokens();
  if (tokens.length === 0) {
    console.log("[notifications] No premium users to notify");
    return { sent: 0, quoteId: null };
  }

  const quote = await getRandomPremiumQuote();
  if (!quote) {
    console.warn("[notifications] No premium quotes available");
    return { sent: 0, quoteId: null };
  }

  await sendPushNotifications(tokens, "Focus", truncate(quote.text, 120), {
    type: "premium_quote",
    quoteId: quote.id,
    author: quote.author,
    topicId: quote.topic?.id,
  });

  return { sent: tokens.length, quoteId: quote.id };
}

// ==================== NEW PREMIUM QUOTES ====================

/**
 * Tells premium users that new premium quotes are out.
 *
 * NestJS polled every hour for premium quotes created in the last hour; this
 * is called by whoever creates the quotes instead, with those quotes. Same
 * audience and message: the first premium quote's text, and the count. Quotes
 * outside a premium topic are ignored, and nothing is sent if none is left.
 *
 * The quotes are read again with their topic, so callers may pass them with
 * or without the relation loaded. Callers in a request should run this in
 * `after()` so the response does not wait for Expo.
 */
export async function notifyNewPremiumQuotes(quotes: Quote[]): Promise<void> {
  const ids = quotes.map((quote) => quote.id).filter(Boolean);
  if (ids.length === 0) return;

  try {
    const loaded = await (await repo(Quote)).find({ where: { id: In(ids) }, relations: ["topic"] });
    const byId = new Map(loaded.map((quote) => [quote.id, quote]));
    // Keep the caller's order, so "the first new quote" is the one they put first.
    const newQuotes = ids
      .map((id) => byId.get(id))
      .filter((quote): quote is Quote => Boolean(quote?.topic?.isPremium));

    if (newQuotes.length === 0) return;

    const tokens = await getPremiumUserTokens();
    if (tokens.length === 0) {
      console.log("[notifications] No premium users to notify");
      return;
    }

    const quote = newQuotes[0];
    await sendPushNotifications(tokens, "Focus", truncate(quote.text, 100), {
      type: "new_premium_quote",
      quoteId: quote.id,
      author: quote.author,
      topicId: quote.topic?.id,
      totalNewQuotes: newQuotes.length,
    });

    console.log(`[notifications] New premium quote notification sent to ${tokens.length} tokens`);
  } catch (error) {
    // As the NestJS cron did: a failed announcement must not fail the caller.
    console.error("[notifications] Error notifying new premium quotes", error);
  }
}

// ==================== ADMIN ====================

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A given quote, or a random premium one, to every premium user. */
export async function sendManualPremiumQuoteNotification(
  quoteId?: string,
): Promise<{ sent: number; message: string }> {
  const tokens = await getPremiumUserTokens();
  if (tokens.length === 0) return { sent: 0, message: "No premium users to notify" };

  let quote: Quote | null;
  if (quoteId) {
    // A malformed id is a quote that does not exist (NestJS let Postgres
    // reject it and answered 500).
    quote = UUID.test(quoteId)
      ? await (await repo(Quote)).findOne({ where: { id: quoteId }, relations: ["topic"] })
      : null;
  } else {
    quote = await getRandomPremiumQuote();
  }

  if (!quote) return { sent: 0, message: "Quote not found" };

  await sendPushNotifications(tokens, "Focus", truncate(quote.text, 100), {
    type: "manual_premium_quote",
    quoteId: quote.id,
    author: quote.author,
    topicId: quote.topic?.id,
  });

  return { sent: tokens.length, message: `Notification sent to ${tokens.length} premium users` };
}

/** An app update or announcement, to every premium user. */
export async function sendAnnouncementToPremiumUsers(
  title: string | undefined,
  body: string | undefined,
  data?: Record<string, unknown>,
): Promise<{ sent: number }> {
  const tokens = await getPremiumUserTokens();
  if (tokens.length === 0) return { sent: 0 };

  await sendPushNotifications(tokens, title, body, { type: "announcement", ...data });
  return { sent: tokens.length };
}
