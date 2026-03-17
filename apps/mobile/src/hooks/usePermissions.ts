import { useEffect, useState } from "react";
import { Platform, Alert, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useTranslation } from "react-i18next";

const PERMISSIONS_ASKED_KEY = "@focus_permissions_asked";

interface PermissionStatus {
  notifications: boolean;
  hasAskedBefore: boolean;
}

export const usePermissions = () => {
  const { t } = useTranslation();
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    notifications: false,
    hasAskedBefore: false,
  });

  useEffect(() => {
    checkAndRequestPermissions();
  }, []);

  const checkAndRequestPermissions = async () => {
    try {
      // Check if we've already asked for permissions
      const hasAsked = await AsyncStorage.getItem(PERMISSIONS_ASKED_KEY);

      if (hasAsked === "true") {
        // Already asked, just check current status
        const { status } = await Notifications.getPermissionsAsync();
        setPermissionStatus({
          notifications: status === "granted",
          hasAskedBefore: true,
        });
        return;
      }

      // First time - ask for permissions
      await requestNotificationPermission();

      // Mark as asked
      await AsyncStorage.setItem(PERMISSIONS_ASKED_KEY, "true");
    } catch (error) {
      console.error("Error checking permissions:", error);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      if (existingStatus === "granted") {
        setPermissionStatus((prev) => ({ ...prev, notifications: true }));
        return true;
      }

      const { status } = await Notifications.requestPermissionsAsync();

      setPermissionStatus({
        notifications: status === "granted",
        hasAskedBefore: true,
      });

      return status === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  const openSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  };

  const showPermissionAlert = () => {
    Alert.alert(
      t("permissions.notificationsTitle"),
      t("permissions.notificationsMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("permissions.openSettings"),
          onPress: openSettings,
        },
      ],
    );
  };

  return {
    permissionStatus,
    requestNotificationPermission,
    openSettings,
    showPermissionAlert,
    checkAndRequestPermissions,
  };
};

