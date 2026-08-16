import "server-only";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { repo } from "../db";
import { Quote, User, UserActivity, UserNotificationSettings } from "../db/entities";
import { badRequest, conflict, notFound, unauthorized } from "../http/errors";
import { isPremium } from "./premium";
import { publicUser } from "./serialize";

/**
 * The most notifications a free account may ask for per day. NestJS imported
 * this from the notifications service (the sender applies the same ceiling);
 * it is repeated here so this module does not depend on the sender.
 * Keep the two in sync.
 */
const FREE_MAX_NOTIFICATIONS_PER_DAY = 3;

const BCRYPT_COST = 10;

const DEFAULT_NOTIFICATION_SETTINGS = {
  enabled: false,
  startTime: "09:00",
  endTime: "18:00",
  maxNotificationsPerDay: 3,
  activeDays: "[0,1,2,3,4,5,6]",
  timezone: "UTC",
  dailyNotificationTracker: '{"date":"","count":0,"times":[]}',
} as const;

// ==================== Users ====================

export interface CreateUserInput {
  email: string;
  password?: string;
  name?: string | null;
  /** Only the admin-only `POST /users` passes this; registration never does. */
  isAdmin?: boolean;
}

/**
 * Creates an account. The email is stored as sent — NestJS did not normalise
 * it here, and login matches it exactly, so changing one without the other
 * would lock existing mixed-case accounts out.
 */
export async function createUser(input: CreateUserInput) {
  const users = await repo(User);
  const existing = await users.findOne({ where: { email: input.email }, select: ["id"] });
  if (existing) throw conflict("Email already exists");

  const user = users.create({
    email: input.email,
    name: input.name ?? null,
    password: input.password ? await bcrypt.hash(input.password, BCRYPT_COST) : null,
    ...(input.isAdmin !== undefined ? { isAdmin: input.isAdmin } : {}),
  });
  return publicUser(await users.save(user));
}

export async function findAllUsers() {
  const users = await (await repo(User)).find();
  return users.map((user) => publicUser(user));
}

/**
 * The user, with the number of their favourites.
 *
 * The count is computed by the database and comes back as an integer, rather
 * than loading every liked quote just to read the length of the array.
 */
async function userWithLikeCount(where: "id" | "email", value: string) {
  const user = await (await repo(User))
    .createQueryBuilder("user")
    .loadRelationCountAndMap("user.likedQuotesCount", "user.likedQuotes")
    .where(`user.${where} = :value`, { value })
    .getOne();
  return user as (User & { likedQuotesCount?: number }) | null;
}

/** The user as the clients read it: with `likedQuotesCount` and `isPremium`, without private fields. */
export async function findUser(id: string) {
  const user = await userWithLikeCount("id", id);
  if (!user) return null;
  return publicUser({ ...user, likedQuotesCount: user.likedQuotesCount ?? 0, isPremium: isPremium(user) });
}

/** Keeps the password hash: login compares it right after. Never return this to a client. */
export async function findUserByEmailWithPassword(email: string) {
  return userWithLikeCount("email", email);
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  name?: string | null;
  avatar?: string | null;
  isAdmin?: boolean;
  isSubscribed?: boolean;
  subscriptionEndDate?: string | null;
  usedPromoCode?: string | null;
}

/** Admin edit (the admin panel toggles `isAdmin` and `isSubscribed` through it). */
export async function updateUser(id: string, input: UpdateUserInput) {
  const users = await repo(User);
  const user = await users.findOne({ where: { id } });
  if (!user) return null;

  const data: UpdateUserInput = { ...input };
  if (data.password) data.password = await bcrypt.hash(data.password, BCRYPT_COST);
  else delete data.password;
  Object.assign(user, data);
  return publicUser(await users.save(user));
}

/** Returns TypeORM's DeleteResult, as NestJS did. */
export async function removeUser(id: string) {
  return (await repo(User)).delete(id);
}

// ==================== Notification Settings ====================

export interface UpdateNotificationSettingsInput {
  enabled?: boolean;
  startTime?: string;
  endTime?: string;
  maxNotificationsPerDay?: number;
  activeDays?: number[] | string;
  timezone?: string;
}

export async function getNotificationSettings(userId: string) {
  const settingsRepo = await repo(UserNotificationSettings);
  let settings = await settingsRepo.findOne({ where: { userId } });

  // Create default settings if they don't exist
  if (!settings) {
    settings = settingsRepo.create({ userId, ...DEFAULT_NOTIFICATION_SETTINGS });
    await settingsRepo.save(settings);
  }
  return settings;
}

export async function updateNotificationSettings(userId: string, input: UpdateNotificationSettingsInput) {
  const settingsRepo = await repo(UserNotificationSettings);
  const settings = await settingsRepo.findOne({ where: { userId } });

  // The column holds the weekdays as a JSON string.
  const updateData: Record<string, unknown> = { ...input };
  if (Array.isArray(input.activeDays)) updateData.activeDays = JSON.stringify(input.activeDays);

  // Freemium cap: free users can request at most three notifications per
  // day — the same ceiling the sender applies. Premium users keep whatever
  // value they sent.
  if (input.maxNotificationsPerDay !== undefined) {
    const user = await (await repo(User)).findOne({
      where: { id: userId },
      select: ["id", "isSubscribed", "subscriptionEndDate"],
    });
    const premium = user ? isPremium(user) : false;
    if (!premium && input.maxNotificationsPerDay > FREE_MAX_NOTIFICATIONS_PER_DAY) {
      updateData.maxNotificationsPerDay = FREE_MAX_NOTIFICATIONS_PER_DAY;
    }
  }

  if (!settings) {
    return settingsRepo.save(settingsRepo.create({ userId, ...updateData }));
  }
  Object.assign(settings, updateData);
  return settingsRepo.save(settings);
}

export async function resetNotificationSettings(userId: string) {
  const settingsRepo = await repo(UserNotificationSettings);
  const settings = await settingsRepo.findOne({ where: { userId } });
  if (settings) {
    Object.assign(settings, DEFAULT_NOTIFICATION_SETTINGS);
    return settingsRepo.save(settings);
  }
  return getNotificationSettings(userId);
}

// ==================== User Activity ====================

/** One row per user and day; each app open bumps the day's counter. */
export async function trackActivity(userId: string, date: string) {
  const activities = await repo(UserActivity);
  let activity = await activities.findOne({ where: { userId, date } });

  if (activity) {
    activity.openCount += 1;
    activity.lastOpenedAt = new Date();
  } else {
    activity = activities.create({ userId, date, openCount: 1, lastOpenedAt: new Date() });
  }
  return activities.save(activity);
}

export async function getUserActivity(userId: string, startDate?: string, endDate?: string) {
  const query = (await repo(UserActivity))
    .createQueryBuilder("activity")
    .where("activity.userId = :userId", { userId });

  if (startDate) query.andWhere("activity.date >= :startDate", { startDate });
  if (endDate) query.andWhere("activity.date <= :endDate", { endDate });

  return query.orderBy("activity.date", "DESC").getMany();
}

export async function getActivityStats(userId: string, year: number, month: number) {
  // First and last day of the month
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const activities = await getUserActivity(userId, startDate, endDate);

  const totalDays = lastDay;
  const activeDays = activities.length;
  const totalOpens = activities.reduce((sum, activity) => sum + activity.openCount, 0);

  return {
    year,
    month,
    totalDays,
    activeDays,
    inactiveDays: totalDays - activeDays,
    totalOpens,
    activities: activities.map((a) => ({ date: a.date, openCount: a.openCount })),
  };
}

// ==================== Liked Quotes (Favorites) ====================

/**
 * The favourites, newest quote first. Querying the quotes rather than the
 * user avoids materialising the User and its relation: same join, one query,
 * and it can be sorted.
 */
export async function getLikedQuotes(userId: string) {
  const quotes = await (await repo(Quote))
    .createQueryBuilder("quote")
    .leftJoinAndSelect("quote.topic", "topic")
    .innerJoin("quote.likedBy", "liker", "liker.id = :userId", { userId })
    .orderBy("quote.createdAt", "DESC")
    .getMany();

  return quotes.map((quote) => ({ ...quote, isLiked: true }));
}

// ==================== Profile Update ====================

export async function updateProfile(userId: string, data: { name?: string | null; avatar?: string | null }) {
  const users = await repo(User);
  const user = await users.findOne({ where: { id: userId } });
  if (!user) return null;

  if (data.name !== undefined) user.name = data.name;
  if (data.avatar !== undefined) user.avatar = data.avatar;
  return publicUser(await users.save(user));
}

// ==================== Account Deletion ====================

export async function deleteAccount(userId: string, password: unknown): Promise<void> {
  if (!password || typeof password !== "string") throw badRequest("Password is required");

  const users = await repo(User);
  const user = await users.findOne({ where: { id: userId } });
  if (!user) throw notFound("User not found");

  if (!user.password) throw badRequest("Cannot delete account: no password set (OAuth account)");
  if (!(await bcrypt.compare(password, user.password))) throw unauthorized("Invalid password");

  // Related data first, then the user (the join table rows cascade).
  await (await repo(UserNotificationSettings)).delete({ userId });
  await (await repo(UserActivity)).delete({ userId });
  await users.delete(userId);
}

// ==================== Body schemas shared by the routes ====================

/**
 * The fields of NestJS's UpdateNotificationSettingsDto. Its decorators were
 * never enforced, so the ranges are not either; unknown keys are dropped
 * (NestJS assigned the whole body, `userId` and the send tracker included).
 */
export const notificationSettingsBody = z.object({
  enabled: z.boolean().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  maxNotificationsPerDay: z.number().optional(),
  activeDays: z.union([z.array(z.number()), z.string()]).optional(),
  timezone: z.string().optional(),
});
