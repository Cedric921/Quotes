import AsyncStorage from "@react-native-async-storage/async-storage";
import { quotesApi } from "./api";
import {
  areNotificationsEnabled,
  requestNotificationPermissions,
  scheduleDailyNotifications,
  setupNotificationChannel,
  type NotificationConfig,
  type ReminderQuote,
} from "./notificationService";

/** Sunday through Saturday, in the numbering `notificationService` expects. */
const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];

const KEY = "@focus_reminders_v2";

export interface ReminderSchedule {
  /** How many reminders to spread across the window. */
  count: number;
  startHour: number;
  endHour: number;
}

export interface ReminderResult {
  granted: boolean;
  scheduled: number;
}

export interface ReminderContent {
  /** Premium quotes go into a subscriber's reminders; a free account gets the free ones. */
  includePremium: boolean;
}

/**
 * Spreads `count` reminders evenly across the waking window.
 *
 * Evenly rather than randomly: a user who asks for 11 a day and gets three in
 * one hour uninstalls. The first lands on the start hour and the last on the
 * end hour, so the window the user picked is the window they get.
 */
export const buildTimes = ({
  count,
  startHour,
  endHour,
}: ReminderSchedule): { hour: number; minute: number }[] => {
  const span = Math.max(0, endHour - startHour);
  if (count <= 1 || span === 0) return [{ hour: startHour, minute: 0 }];

  const stepMinutes = (span * 60) / (count - 1);
  return Array.from({ length: count }, (_, i) => {
    const total = startHour * 60 + Math.round(stepMinutes * i);
    return { hour: Math.floor(total / 60) % 24, minute: total % 60 };
  });
};

/**
 * One quote per slot, drawn through the feed's own shuffle so two launches
 * get two different sets. Best-effort: a reminder that rings with the
 * fallback sentence beats one that never got scheduled because the API was
 * asleep.
 */
const fetchQuotePool = async (
  count: number,
  { includePremium }: ReminderContent,
): Promise<ReminderQuote[]> => {
  try {
    const quotes = await quotesApi.getQuotes(1, count, undefined, includePremium);
    return quotes.map(({ id, text, author }) => ({ id, text, author }));
  } catch {
    return [];
  }
};

const scheduleWithContent = async (
  schedule: ReminderSchedule,
  content: ReminderContent,
): Promise<number> => {
  // A reminder the user asked for daily runs every day of the week; the
  // scheduler takes one entry per time, each carrying its own days.
  const times = buildTimes(schedule);
  const configs: NotificationConfig[] = times.map(({ hour, minute }) => ({
    time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    days: EVERY_DAY,
  }));

  const quotes = await fetchQuotePool(times.length, content);
  await scheduleDailyNotifications(configs, quotes);
  return times.length;
};

/**
 * Asks for permission *and* schedules, in that order, from a single user
 * action. The v2 onboarding never triggers the system dialog on screen entry.
 */
export const requestAndSchedule = async (
  schedule: ReminderSchedule,
  content: ReminderContent = { includePremium: false },
): Promise<ReminderResult> => {
  const status = await requestNotificationPermissions();
  if (!status.granted) return { granted: false, scheduled: 0 };

  await setupNotificationChannel();

  const scheduled = await scheduleWithContent(schedule, content);
  await saveSchedule(schedule);
  return { granted: true, scheduled };
};

/**
 * Re-draws the quotes behind the saved schedule, keeping the times.
 *
 * A daily trigger repeats the same content until it is replaced, so without
 * this the 9 o'clock reminder would read the same quote every morning. Run
 * on launch; a no-op when nothing was ever scheduled or permission is gone.
 */
export const refreshContent = async (
  content: ReminderContent,
): Promise<void> => {
  const schedule = await loadSchedule();
  if (!schedule) return;
  if (!(await areNotificationsEnabled())) return;

  try {
    await scheduleWithContent(schedule, content);
  } catch (error) {
    console.warn("[Reminders] content not refreshed:", error);
  }
};

/**
 * The schedule currently on the device.
 *
 * Reopening "Rappels" from the profile used to show the defaults — ten a day
 * between 9 and 22 — whatever the user had set, and saving from there
 * silently reset them to it.
 */
export const loadSchedule = async (): Promise<ReminderSchedule | null> => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ReminderSchedule) : null;
  } catch {
    return null;
  }
};

const saveSchedule = async (schedule: ReminderSchedule): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(schedule));
  } catch {
    // The notifications are scheduled either way; this only pre-fills a form.
  }
};

export const remindersService = {
  buildTimes,
  requestAndSchedule,
  refreshContent,
  loadSchedule,
};
