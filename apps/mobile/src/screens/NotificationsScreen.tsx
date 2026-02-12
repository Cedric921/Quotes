import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../hooks";
import { useAppSelector } from "../store/hooks";
import * as Haptics from "expo-haptics";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
  useResetNotificationSettings,
} from "../api/hooks/useNotificationSettings";
import {
  requestNotificationPermissions,
  scheduleDailyNotifications,
  cancelAllNotifications,
  sendTestNotification,
} from "../services/notificationService";

interface NotificationsScreenProps {
  readonly navigation: any;
}

export const NotificationsScreen = ({
  navigation,
}: NotificationsScreenProps) => {
  const { t } = useTranslation();
  const { colors, isDark } = useThemeColors();
  const user = useAppSelector((state) => state.auth.user);

  // Check if user is subscribed or admin (premium feature)
  const isSubscribed = user?.isSubscribed || user?.isAdmin || false;

  const { data: settings, isLoading } = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();
  const resetSettings = useResetNotificationSettings();

  interface NotificationTime {
    id: string;
    time: Date;
    days: number[]; // Days for this specific notification
    showPicker: boolean;
    isExpanded: boolean;
  }

  const [enabled, setEnabled] = useState(false);
  const [notificationTimes, setNotificationTimes] = useState<
    NotificationTime[]
  >([
    {
      id: "1",
      time: new Date(new Date().setHours(9, 0, 0, 0)),
      days: [0, 1, 2, 3, 4, 5, 6], // All days by default
      showPicker: false,
      isExpanded: true,
    },
    {
      id: "2",
      time: new Date(new Date().setHours(18, 0, 0, 0)),
      days: [0, 1, 2, 3, 4, 5, 6], // All days by default
      showPicker: false,
      isExpanded: true,
    },
  ]);

  // Initialize state from settings
  useEffect(() => {
    if (settings) {
      console.log("Settings loaded:", JSON.stringify(settings, null, 2));
      // Handle SQLite boolean (0/1) and JavaScript boolean
      const isEnabled = Boolean(settings.enabled);
      console.log(
        "Setting enabled to:",
        isEnabled,
        "(raw value:",
        settings.enabled,
        ")",
      );
      setEnabled(isEnabled);

      if (settings.notifications) {
        try {
          const notificationsConfig = JSON.parse(settings.notifications);
          const newNotificationTimes: NotificationTime[] =
            notificationsConfig.map(
              (config: { time: string; days: number[] }, index: number) => {
                const [hours, minutes] = config.time.split(":");
                const date = new Date();
                date.setHours(Number.parseInt(hours, 10));
                date.setMinutes(Number.parseInt(minutes, 10));
                return {
                  id: String(index + 1),
                  time: date,
                  days: config.days || [0, 1, 2, 3, 4, 5, 6],
                  showPicker: false,
                  isExpanded: true,
                };
              },
            );
          setNotificationTimes(newNotificationTimes);
        } catch (error) {
          console.error("Failed to parse notifications:", error);
        }
      }
    }
  }, [settings]);

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleToggleNotifications = async (value: boolean) => {
    // Check if user is subscribed
    if (!isSubscribed) {
      Toast.show({
        type: "error",
        text1: t("notifications.subscriptionRequired"),
        text2: t("notifications.subscribeToEnableNotifications"),
      });
      return;
    }

    if (value) {
      // Request permissions
      const { granted } = await requestNotificationPermissions();

      if (!granted) {
        Toast.show({
          type: "error",
          text1: t("notifications.permissionDenied"),
          text2: t("notifications.enableNotificationsInSettings"),
        });
        return;
      }
    }

    setEnabled(value);

    const notificationsConfig = notificationTimes.map((nt) => ({
      time: formatTime(nt.time),
      days: nt.days,
    }));

    // Update settings
    await updateSettings.mutateAsync({
      enabled: value,
      notifications: notificationsConfig,
    });

    if (value) {
      await scheduleDailyNotifications(notificationsConfig);
      Toast.show({
        type: "success",
        text1: t("notifications.notificationsEnabled"),
      });
    } else {
      await cancelAllNotifications();
      Toast.show({
        type: "success",
        text1: t("notifications.notificationsDisabled"),
      });
    }
  };

  const handleTimeChange = async (
    id: string,
    _event: any,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === "android") {
      // Close all pickers on Android
      setNotificationTimes((prev) =>
        prev.map((nt) => ({ ...nt, showPicker: false })),
      );
    }

    if (selectedDate) {
      // Update the specific notification time
      setNotificationTimes((prev) =>
        prev.map((nt) => (nt.id === id ? { ...nt, time: selectedDate } : nt)),
      );

      // Update settings if notifications are enabled
      if (enabled) {
        const updatedNotifications = notificationTimes.map((nt) => ({
          time: nt.id === id ? formatTime(selectedDate) : formatTime(nt.time),
          days: nt.days,
        }));

        await updateSettings.mutateAsync({
          notifications: updatedNotifications,
        });

        await scheduleDailyNotifications(updatedNotifications);
      }
    }
  };

  const toggleDay = async (notificationId: string, day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const notification = notificationTimes.find(
      (nt) => nt.id === notificationId,
    );
    if (!notification) return;

    let newDays: number[];
    if (notification.days.includes(day)) {
      // Don't allow deselecting all days
      if (notification.days.length === 1) {
        Toast.show({
          type: "error",
          text1: t("notifications.selectAtLeastOneDay"),
        });
        return;
      }
      newDays = notification.days.filter((d) => d !== day);
    } else {
      newDays = [...notification.days, day].sort((a, b) => a - b);
    }

    // Update the notification's days
    setNotificationTimes((prev) =>
      prev.map((nt) =>
        nt.id === notificationId ? { ...nt, days: newDays } : nt,
      ),
    );

    // Update settings if notifications are enabled
    if (enabled) {
      const updatedNotifications = notificationTimes.map((nt) => ({
        time: formatTime(nt.time),
        days: nt.id === notificationId ? newDays : nt.days,
      }));

      await updateSettings.mutateAsync({
        notifications: updatedNotifications,
      });

      await scheduleDailyNotifications(updatedNotifications);
    }
  };

  const addNotification = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (notificationTimes.length >= 5) {
      Toast.show({
        type: "error",
        text1: t("notifications.maxNotificationsReached"),
      });
      return;
    }

    const newId = String(Date.now());
    const newTime = new Date(new Date().setHours(12, 0, 0, 0));

    setNotificationTimes((prev) => [
      ...prev,
      {
        id: newId,
        time: newTime,
        days: [0, 1, 2, 3, 4, 5, 6], // All days by default
        showPicker: false,
        isExpanded: true,
      },
    ]);
  };

  const removeNotification = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (notificationTimes.length <= 1) {
      Toast.show({
        type: "error",
        text1: t("notifications.minNotificationsRequired"),
      });
      return;
    }

    const newTimes = notificationTimes.filter((nt) => nt.id !== id);
    setNotificationTimes(newTimes);

    // Update settings if notifications are enabled
    if (enabled) {
      const updatedNotifications = newTimes.map((nt) => ({
        time: formatTime(nt.time),
        days: nt.days,
      }));

      await updateSettings.mutateAsync({
        notifications: updatedNotifications,
      });

      await scheduleDailyNotifications(updatedNotifications);
    }
  };

  const toggleCardExpanded = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotificationTimes((prev) =>
      prev.map((nt) =>
        nt.id === id ? { ...nt, isExpanded: !nt.isExpanded } : nt,
      ),
    );
  };

  const togglePicker = (id: string, show: boolean) => {
    setNotificationTimes((prev) =>
      prev.map((nt) => (nt.id === id ? { ...nt, showPicker: show } : nt)),
    );
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  if (!isSubscribed) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("notifications.title")}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.subscriptionRequired}>
          <Ionicons name="lock-closed" size={64} color={colors.textSecondary} />
          <Text style={[styles.title, { color: colors.text }]}>
            {t("notifications.premiumFeature")}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t("notifications.subscribeToEnableNotifications")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("notifications.title")}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <Text style={[styles.loading, { color: colors.textSecondary }]}>
          {t("common.loading")}...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("notifications.title")}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Enable/Disable Toggle */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.row}>
            <View style={styles.labelContainer}>
              <Ionicons name="notifications" size={24} color={colors.primary} />
              <Text style={[styles.label, { color: colors.text }]}>
                {t("notifications.enableNotifications")}
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={enabled ? colors.background : colors.textSecondary}
            />
          </View>
        </View>

        {/* Notification Cards */}
        {enabled && (
          <>
            {notificationTimes.map((notification, index) => (
              <View
                key={notification.id}
                style={[styles.section, { backgroundColor: colors.card }]}
              >
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => toggleCardExpanded(notification.id)}
                >
                  <View style={styles.cardHeaderLeft}>
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <Text
                      style={[
                        styles.sectionTitle,
                        { color: colors.text, marginBottom: 0 },
                      ]}
                    >
                      {t("notifications.notification", { number: index + 1 })}
                    </Text>
                  </View>
                  <View style={styles.cardHeaderRight}>
                    {notificationTimes.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeNotification(notification.id)}
                        style={styles.removeButton}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={colors.error || "#FF3B30"}
                        />
                      </TouchableOpacity>
                    )}
                    <Ionicons
                      name={
                        notification.isExpanded ? "chevron-up" : "chevron-down"
                      }
                      size={20}
                      color={colors.textSecondary}
                    />
                  </View>
                </TouchableOpacity>

                {notification.isExpanded && (
                  <>
                    {/* Time Picker */}
                    <TouchableOpacity
                      style={[
                        styles.timePicker,
                        { borderColor: colors.border },
                      ]}
                      onPress={() => togglePicker(notification.id, true)}
                    >
                      <Ionicons
                        name="time-outline"
                        size={20}
                        color={colors.primary}
                      />
                      <Text style={[styles.timeText, { color: colors.text }]}>
                        {formatTime(notification.time)}
                      </Text>
                    </TouchableOpacity>

                    {(notification.showPicker || Platform.OS === "ios") && (
                      <DateTimePicker
                        value={notification.time}
                        mode="time"
                        is24Hour={true}
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(event, date) =>
                          handleTimeChange(notification.id, event, date)
                        }
                        themeVariant={isDark ? "dark" : "light"}
                      />
                    )}

                    {/* Days Selector for this notification */}
                    <View style={styles.daysSection}>
                      <View style={styles.sectionHeader}>
                        <Ionicons
                          name="calendar-outline"
                          size={18}
                          color={colors.primary}
                        />
                        <Text
                          style={[
                            styles.daysSectionTitle,
                            { color: colors.text },
                          ]}
                        >
                          {t("notifications.selectDays")}
                        </Text>
                      </View>
                      <View style={styles.daysContainer}>
                        {[
                          { day: 0, label: t("notifications.days.sunday") },
                          { day: 1, label: t("notifications.days.monday") },
                          { day: 2, label: t("notifications.days.tuesday") },
                          { day: 3, label: t("notifications.days.wednesday") },
                          { day: 4, label: t("notifications.days.thursday") },
                          { day: 5, label: t("notifications.days.friday") },
                          { day: 6, label: t("notifications.days.saturday") },
                        ].map(({ day, label }) => (
                          <TouchableOpacity
                            key={day}
                            style={[
                              styles.dayButton,
                              {
                                backgroundColor: notification.days.includes(day)
                                  ? colors.primary
                                  : colors.backgroundSecondary,
                                borderColor: notification.days.includes(day)
                                  ? colors.primary
                                  : colors.border,
                              },
                            ]}
                            onPress={() => toggleDay(notification.id, day)}
                          >
                            <Text
                              style={[
                                styles.dayButtonText,
                                {
                                  color: notification.days.includes(day)
                                    ? "#fff"
                                    : colors.textSecondary,
                                },
                              ]}
                            >
                              {label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </>
                )}
              </View>
            ))}

            {/* Add Notification Button */}
            {notificationTimes.length < 5 && (
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
                onPress={addNotification}
              >
                <Ionicons name="add-circle" size={24} color={colors.primary} />
                <Text style={[styles.addButtonText, { color: colors.primary }]}>
                  {t("notifications.addNotification")}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Action Buttons */}
        {enabled && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={sendTestNotification}
            >
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.buttonText}>
                {t("notifications.sendTestNotification")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.backgroundSecondary },
              ]}
              onPress={async () => {
                await resetSettings.mutateAsync();
                Toast.show({
                  type: "success",
                  text1: t("notifications.settingsReset"),
                });
              }}
            >
              <Ionicons name="refresh" size={20} color={colors.text} />
              <Text style={[styles.buttonText, { color: colors.text }]}>
                {t("notifications.resetToDefaults")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info */}
        <View
          style={[styles.info, { backgroundColor: colors.backgroundSecondary }]}
        >
          <Ionicons
            name="information-circle"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {t("notifications.notificationsInfo")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  daysSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  daysSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 50,
    alignItems: "center",
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  timePicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
  },
  timeText: {
    fontSize: 18,
    fontWeight: "600",
  },
  actions: {
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  info: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  subscriptionRequired: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
  },
  loading: {
    textAlign: "center",
    marginTop: 32,
    fontSize: 16,
  },
});
