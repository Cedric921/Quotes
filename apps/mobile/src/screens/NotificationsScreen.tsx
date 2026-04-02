import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";
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
  useRegisterPushToken,
  useUnregisterAllPushTokens,
} from "../api/hooks/usePushToken";
import {
  requestNotificationPermissions,
  cancelAllNotifications,
  getExpoPushToken,
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
  const isPremium = user?.isSubscribed || user?.isAdmin || false;
  // Free users can have max 2 notifications, premium users up to 10
  const maxAllowed = isPremium ? 10 : 2;

  const {
    data: settings,
    isLoading,
    isRefetching,
    refetch,
  } = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();
  const resetSettings = useResetNotificationSettings();
  const registerPushToken = useRegisterPushToken();
  const unregisterAllPushTokens = useUnregisterAllPushTokens();

  // State for notification settings
  const [enabled, setEnabled] = useState(false);
  const [startTime, setStartTime] = useState(
    new Date(new Date().setHours(9, 0, 0, 0)),
  );
  const [endTime, setEndTime] = useState(
    new Date(new Date().setHours(18, 0, 0, 0)),
  );
  const [maxNotificationsPerDay, setMaxNotificationsPerDay] = useState(3);
  const [activeDays, setActiveDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Initialize state from settings
  useEffect(() => {
    if (settings) {
      const isEnabled = Boolean(settings.enabled);
      setEnabled(isEnabled);

      // Parse start time
      if (settings.startTime) {
        const [hours, minutes] = settings.startTime.split(":");
        const date = new Date();
        date.setHours(
          Number.parseInt(hours, 10),
          Number.parseInt(minutes, 10),
          0,
          0,
        );
        setStartTime(date);
      }

      // Parse end time
      if (settings.endTime) {
        const [hours, minutes] = settings.endTime.split(":");
        const date = new Date();
        date.setHours(
          Number.parseInt(hours, 10),
          Number.parseInt(minutes, 10),
          0,
          0,
        );
        setEndTime(date);
      }

      // Parse max notifications
      if (settings.maxNotificationsPerDay) {
        setMaxNotificationsPerDay(settings.maxNotificationsPerDay);
      }

      // Parse active days
      if (settings.activeDays) {
        try {
          // activeDays can be either an array or a JSON string
          if (Array.isArray(settings.activeDays)) {
            setActiveDays(settings.activeDays);
          } else if (typeof settings.activeDays === "string") {
            const days = JSON.parse(settings.activeDays);
            setActiveDays(days);
          }
        } catch (error) {
          console.error("Failed to parse activeDays:", error);
          // Default to all days if parsing fails
          setActiveDays([0, 1, 2, 3, 4, 5, 6]);
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

      // Get and register push token with the server
      try {
        const pushToken = await getExpoPushToken();
        if (pushToken) {
          await registerPushToken.mutateAsync(pushToken);
          console.log("Push token registered with server:", pushToken);
        } else {
          console.warn("Could not get push token");
        }
      } catch (error) {
        console.error("Error registering push token:", error);
      }
    } else {
      // Unregister push tokens when disabling notifications
      try {
        await unregisterAllPushTokens.mutateAsync();
        console.log("Push tokens unregistered from server");
      } catch (error) {
        console.error("Error unregistering push tokens:", error);
      }
    }

    setEnabled(value);

    // Update settings on server
    await updateSettings.mutateAsync({
      enabled: value,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      maxNotificationsPerDay,
      activeDays,
    });

    if (value) {
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

  const handleStartTimeChange = async (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowStartPicker(false);
    }

    if (selectedDate) {
      setStartTime(selectedDate);

      if (enabled) {
        await updateSettings.mutateAsync({
          startTime: formatTime(selectedDate),
        });
      }
    }
  };

  const handleEndTimeChange = async (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowEndPicker(false);
    }

    if (selectedDate) {
      setEndTime(selectedDate);

      if (enabled) {
        await updateSettings.mutateAsync({
          endTime: formatTime(selectedDate),
        });
      }
    }
  };

  const handleMaxNotificationsChange = async (value: number) => {
    const roundedValue = Math.round(value);
    setMaxNotificationsPerDay(roundedValue);
  };

  const handleMaxNotificationsSlidingComplete = async (value: number) => {
    const roundedValue = Math.round(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (enabled) {
      await updateSettings.mutateAsync({
        maxNotificationsPerDay: roundedValue,
      });
    }
  };

  const toggleDay = async (day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let newDays: number[];
    if (activeDays.includes(day)) {
      // Don't allow deselecting all days
      if (activeDays.length === 1) {
        Toast.show({
          type: "error",
          text1: t("notifications.selectAtLeastOneDay"),
        });
        return;
      }
      newDays = activeDays.filter((d) => d !== day);
    } else {
      newDays = [...activeDays, day].sort((a, b) => a - b);
    }

    setActiveDays(newDays);

    if (enabled) {
      await updateSettings.mutateAsync({
        activeDays: newDays,
      });
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

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

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.primary}
          />
        }
      >
        {/* Enable/Disable Toggle */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
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

        {/* Time Range Section */}
        {enabled && (
          <>
            {/* Time Window */}
            <View
              style={[
                styles.section,
                { backgroundColor: colors.backgroundSecondary },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t("notifications.timeWindow")}
                </Text>
              </View>

              <Text
                style={[styles.description, { color: colors.textSecondary }]}
              >
                {t("notifications.timeWindowDescription")}
              </Text>

              {/* Start Time */}
              <View style={styles.timeRow}>
                <Text style={[styles.timeLabel, { color: colors.text }]}>
                  {t("notifications.startTime")}
                </Text>
                <TouchableOpacity
                  style={[styles.timePicker, { borderColor: colors.border }]}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={[styles.timeText, { color: colors.text }]}>
                    {formatTime(startTime)}
                  </Text>
                </TouchableOpacity>
              </View>

              {(showStartPicker || Platform.OS === "ios") && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleStartTimeChange}
                  themeVariant={isDark ? "dark" : "light"}
                />
              )}

              {/* End Time */}
              <View style={styles.timeRow}>
                <Text style={[styles.timeLabel, { color: colors.text }]}>
                  {t("notifications.endTime")}
                </Text>
                <TouchableOpacity
                  style={[styles.timePicker, { borderColor: colors.border }]}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={[styles.timeText, { color: colors.text }]}>
                    {formatTime(endTime)}
                  </Text>
                </TouchableOpacity>
              </View>

              {(showEndPicker || Platform.OS === "ios") && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleEndTimeChange}
                  themeVariant={isDark ? "dark" : "light"}
                />
              )}
            </View>

            {/* Max Notifications Per Day */}
            <View
              style={[
                styles.section,
                { backgroundColor: colors.backgroundSecondary },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="analytics-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t("notifications.maxPerDay")}
                </Text>
              </View>

              <Text
                style={[styles.description, { color: colors.textSecondary }]}
              >
                {t("notifications.maxPerDayDescription")}
              </Text>

              <View style={styles.sliderContainer}>
                <Text style={[styles.sliderValue, { color: colors.primary }]}>
                  {maxNotificationsPerDay}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={maxAllowed}
                  step={1}
                  value={maxNotificationsPerDay}
                  onValueChange={handleMaxNotificationsChange}
                  onSlidingComplete={handleMaxNotificationsSlidingComplete}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.primary}
                />
                <View style={styles.sliderLabels}>
                  <Text
                    style={[
                      styles.sliderLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    1
                  </Text>
                  <Text
                    style={[
                      styles.sliderLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {maxAllowed}
                  </Text>
                </View>
              </View>

              {!isPremium && maxNotificationsPerDay >= 3 && (
                <View
                  style={[
                    styles.premiumHint,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <Ionicons name="star" size={16} color={colors.primary} />
                  <Text
                    style={[styles.premiumHintText, { color: colors.primary }]}
                  >
                    {t("notifications.upgradeForMore")}
                  </Text>
                </View>
              )}
            </View>

            {/* Active Days */}
            <View
              style={[
                styles.section,
                { backgroundColor: colors.backgroundSecondary },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
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
                        backgroundColor: activeDays.includes(day)
                          ? colors.primary
                          : colors.backgroundSecondary,
                        borderColor: activeDays.includes(day)
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        {
                          color: activeDays.includes(day)
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

        {/* Action Buttons */}
        {enabled && (
          <View style={styles.actions}>
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
    fontSize: 14,
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  sliderContainer: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  sliderValue: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 4,
  },
  sliderLabel: {
    fontSize: 12,
  },
  premiumHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  premiumHintText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loading: {
    textAlign: "center",
    marginTop: 32,
    fontSize: 16,
  },
});
