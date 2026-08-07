import { useCallback } from "react";
import { useAppSelector } from "../../store/hooks";
import { getExpoPushToken } from "../../services/notificationService";
import { useRegisterPushToken } from "./usePushToken";
import { useUpdateNotificationSettings } from "./useNotificationSettings";

/** The API caps a day's notifications lower than the stepper lets you ask for. */
const SERVER_MAX_PER_DAY = 10;

const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];

export interface ReminderWindow {
  /** "HH:mm" */
  startTime: string;
  /** "HH:mm" */
  endTime: string;
  count: number;
}

/**
 * Tells the server about the reminders the device just scheduled.
 *
 * The v2 funnel only ever scheduled local notifications, so on the rewrite the
 * server stopped hearing about any of it: the push token was never registered
 * again and the notification window was never updated. Everything server-sent
 * went quiet for anyone who onboarded on v2.
 *
 * Both calls need an account, and most people reading quotes do not have one —
 * for them the local schedule is the whole feature, and this is a no-op. It is
 * best-effort either way: a reminder that rings on the device is not worth
 * blocking on a server that is asleep.
 */
export function useSyncReminders() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const registerPushToken = useRegisterPushToken();
  const updateSettings = useUpdateNotificationSettings();

  return useCallback(
    async ({ startTime, endTime, count }: ReminderWindow): Promise<void> => {
      if (!isAuthenticated) return;

      try {
        const pushToken = await getExpoPushToken();
        if (pushToken) await registerPushToken.mutateAsync(pushToken);
      } catch (error) {
        console.warn("[Reminders] push token not registered:", error);
      }

      try {
        await updateSettings.mutateAsync({
          enabled: true,
          startTime,
          endTime,
          maxNotificationsPerDay: Math.min(count, SERVER_MAX_PER_DAY),
          activeDays: EVERY_DAY,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      } catch (error) {
        console.warn("[Reminders] settings not synced:", error);
      }
    },
    [isAuthenticated, registerPushToken, updateSettings],
  );
}
