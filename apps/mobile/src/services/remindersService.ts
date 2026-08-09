import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  requestNotificationPermissions,
  scheduleDailyNotifications,
  setupNotificationChannel,
  type NotificationConfig,
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
 * Asks for permission *and* schedules, in that order, from a single user
 * action. The v2 onboarding never triggers the system dialog on screen entry.
 */
export const requestAndSchedule = async (
  schedule: ReminderSchedule,
): Promise<ReminderResult> => {
  const status = await requestNotificationPermissions();
  if (!status.granted) return { granted: false, scheduled: 0 };

  await setupNotificationChannel();

  // A reminder the user asked for daily runs every day of the week; the
  // scheduler takes one entry per time, each carrying its own days.
  const times = buildTimes(schedule);
  const configs: NotificationConfig[] = times.map(({ hour, minute }) => ({
    time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    days: EVERY_DAY,
  }));

  await scheduleDailyNotifications(configs);
  await saveSchedule(schedule);
  return { granted: true, scheduled: times.length };
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
  loadSchedule,
};
