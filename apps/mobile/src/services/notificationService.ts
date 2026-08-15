import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { APP_CONFIG } from "../constants/config";
import i18n from "../i18n";
import { palette } from "../theme/tokens";

// Configure how notifications should be handled when the app is in foreground.
// SDK 54 split the old `shouldShowAlert` into banner and notification-centre
// list; leaving them out means a reminder arrives and shows nothing.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

/**
 * Request notification permissions from the user
 */
export const requestNotificationPermissions =
  async (): Promise<NotificationPermissionStatus> => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return {
      granted: finalStatus === "granted",
      canAskAgain: existingStatus === "undetermined",
    };
  };

export interface NotificationConfig {
  time: string; // "HH:mm" format
  days: number[]; // Array of day numbers (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
}

/** What a reminder needs of a quote: enough to show it and to open it. */
export interface ReminderQuote {
  id: string;
  text: string;
  author?: string;
}

/**
 * The longest body a reminder carries. iOS expands a banner to about four
 * lines and Android to about eight; past that the system cuts the text
 * itself, mid-word, with no ellipsis.
 */
const MAX_BODY_LENGTH = 180;

const bodyFor = (quote: ReminderQuote): string =>
  quote.text.length > MAX_BODY_LENGTH
    ? `${quote.text.slice(0, MAX_BODY_LENGTH - 1).trimEnd()}…`
    : quote.text;

/** Every weekday, in the numbering `NotificationConfig.days` uses. */
const WEEK = [0, 1, 2, 3, 4, 5, 6];
const coversTheWeek = (days: number[]) =>
  WEEK.every((day) => days.includes(day));

/**
 * Schedule notifications with specific times and days
 * @param notifications - Array of notification configurations with time and days
 */
/** Tags the daily reminders so they can be replaced without a blanket cancel. */
const DAILY_KIND = "daily";

/** The one-off "your trial ends soon" notification, scheduled from the paywall. */
export const TRIAL_REMINDER_ID = "focus-trial-reminder";

/**
 * Schedules the reminders, each one carrying a quote.
 *
 * The body used to be a fixed sentence — "Votre citation du moment vous
 * attend." — which is the kind of notification people swipe away without
 * opening. The server's own sends put the quote itself in the body; the
 * local ones now do the same, taking one quote per slot from `quotes` and
 * cycling when there are fewer quotes than slots. Without a pool (offline
 * at schedule time) the sentence stays as the fallback.
 *
 * A reminder set for every day of the week is one daily trigger, not seven
 * weekly ones: iOS keeps at most 64 pending notifications per app, and
 * twenty a day times seven days went silently past that.
 */
export const scheduleDailyNotifications = async (
  notifications: NotificationConfig[],
  quotes: ReminderQuote[] = [],
): Promise<void> => {
  // Replace only the daily reminders. `cancelAllScheduledNotificationsAsync`
  // used to run here, which also dropped the trial reminder the moment the
  // user changed their reminder times.
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.content.data?.kind === DAILY_KIND)
      .map((item) =>
        Notifications.cancelScheduledNotificationAsync(item.identifier),
      ),
  );

  let slot = 0;
  const contentForNextSlot = (): Notifications.NotificationContentInput => {
    const quote = quotes.length ? quotes[slot % quotes.length] : undefined;
    slot += 1;
    return {
      // Read at schedule time, so a reminder speaks the language the app
      // was in when the user set it — it used to be English for all ten
      // locales.
      title: i18n.t("notifications.daily.title"),
      body: quote ? bodyFor(quote) : i18n.t("notifications.daily.body"),
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: quote
        ? { kind: DAILY_KIND, quoteId: quote.id, author: quote.author }
        : { kind: DAILY_KIND },
    };
  };

  for (const notification of notifications) {
    const [hours, minutes] = notification.time.split(":").map(Number);

    if (coversTheWeek(notification.days)) {
      await Notifications.scheduleNotificationAsync({
        content: contentForNextSlot(),
        // The trigger kind became explicit in SDK 54: without `type` the
        // call is rejected and nothing is ever scheduled.
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });
      continue;
    }

    // Schedule a notification for each selected day
    for (const weekday of notification.days) {
      await Notifications.scheduleNotificationAsync({
        content: contentForNextSlot(),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          hour: hours,
          minute: minutes,
          weekday: weekday === 0 ? 1 : weekday + 1, // Convert 0=Sunday to 1=Sunday for expo-notifications
        },
      });
    }
  }
};

/**
 * Schedule the single "your trial ends soon" notification.
 *
 * Fixed identifier, so toggling the switch twice replaces it rather than
 * stacking two. Returns false when the date has already passed — a trial
 * shorter than the reminder window has nothing to remind about.
 */
export const scheduleTrialReminder = async (
  date: Date,
  content: { title: string; body: string },
): Promise<boolean> => {
  await cancelTrialReminder();
  if (date.getTime() <= Date.now()) return false;

  await Notifications.scheduleNotificationAsync({
    identifier: TRIAL_REMINDER_ID,
    content: {
      title: content.title,
      body: content.body,
      sound: true,
      data: { kind: "trial" },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
  return true;
};

export const cancelTrialReminder = async (): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(TRIAL_REMINDER_ID);
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = async () => {
  return await Notifications.getAllScheduledNotificationsAsync();
};

/**
 * Check if notifications are enabled in device settings
 */
export const areNotificationsEnabled = async (): Promise<boolean> => {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
};

/**
 * Send a test notification immediately
 */
export const sendTestNotification = async (): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t("notifications.test.title"),
      body: i18n.t("notifications.test.body"),
      sound: true,
    },
    trigger: null, // Send immediately
  });
};

/**
 * Get notification channel (Android only)
 */
export const setupNotificationChannel = async (): Promise<void> => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      // The LED/notification tint follows the app accent.
      lightColor: palette.violet,
    });
  }
};

/**
 * Get the Expo Push Token for this device
 * This token is used by the server to send push notifications
 */
export const getExpoPushToken = async (): Promise<string | null> => {
  try {
    // Check if we have permission
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      console.log("Notification permissions not granted");
      return null;
    }

    // Get the token using the EAS project ID from config
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: APP_CONFIG.EAS_PROJECT_ID,
    });

    console.log("Expo Push Token:", tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error("Error getting Expo push token:", error);
    return null;
  }
};

/**
 * Add a listener for received notifications (when app is in foreground)
 */
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void,
) => {
  return Notifications.addNotificationReceivedListener(callback);
};

/**
 * Add a listener for notification responses (when user taps on notification)
 */
export const addNotificationResponseReceivedListener = (
  callback: (response: Notifications.NotificationResponse) => void,
) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};
