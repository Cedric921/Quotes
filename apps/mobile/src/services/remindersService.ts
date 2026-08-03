import {
  requestNotificationPermissions,
  scheduleDailyNotifications,
  setupNotificationChannel,
  type NotificationConfig,
} from "./notificationService";

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

  const times = buildTimes(schedule);
  const config: NotificationConfig = {
    times,
    enabled: true,
  } as NotificationConfig;

  await scheduleDailyNotifications(config);
  return { granted: true, scheduled: times.length };
};

export const remindersService = { buildTimes, requestAndSchedule };
