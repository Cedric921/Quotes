import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure how notifications should be handled when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
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

/**
 * Schedule notifications with specific times and days
 * @param notifications - Array of notification configurations with time and days
 */
export const scheduleDailyNotifications = async (
  notifications: NotificationConfig[],
): Promise<void> => {
  // Cancel all existing notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const notification of notifications) {
    const [hours, minutes] = notification.time.split(":").map(Number);

    // Schedule a notification for each selected day
    for (const weekday of notification.days) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "📖 Time for your daily quote",
          body: "Discover inspiring wisdom to brighten your day",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          hour: hours,
          minute: minutes,
          weekday: weekday === 0 ? 1 : weekday + 1, // Convert 0=Sunday to 1=Sunday for expo-notifications
          repeats: true,
        },
      });
    }
  }
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
      title: "🔔 Test Notification",
      body: "Your notifications are working perfectly!",
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
      lightColor: "#FF231F7C",
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

    // Get the token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "your-project-id", // This will be replaced by EAS project ID in production
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
