import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../hooks";
import * as Haptics from "expo-haptics";
import { DaySelector } from "./DaySelector";

export interface NotificationData {
  id: string;
  time: Date;
  days: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
}

interface NotificationCardProps {
  notification: NotificationData;
  index: number;
  canRemove: boolean;
  onUpdate: (notification: NotificationData) => void;
  onRemove: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  index,
  canRemove,
  onUpdate,
  onRemove,
}) => {
  const { t } = useTranslation();
  const { colors, isDark } = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      onUpdate({ ...notification, time: selectedDate });
    }
  };

  const handleDaysChange = (days: number[]) => {
    onUpdate({ ...notification, days });
  };

  const toggleExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(!isExpanded);
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
      ]}
    >
      {/* Card Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerLeft} onPress={toggleExpanded}>
          <Ionicons name="time-outline" size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            {t("notifications.notification", { number: index + 1 })}
          </Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {canRemove && (
          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: colors.error }]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              onRemove();
            }}
          >
            <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Card Content */}
      {isExpanded && (
        <View style={styles.content}>
          {/* Time Picker */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t("notifications.selectTime")}
            </Text>
            <TouchableOpacity
              style={[styles.timePicker, { borderColor: colors.border }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={[styles.timeText, { color: colors.text }]}>
                {formatTime(notification.time)}
              </Text>
            </TouchableOpacity>

            {(showTimePicker || Platform.OS === "ios") && (
              <DateTimePicker
                value={notification.time}
                mode="time"
                is24Hour={true}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleTimeChange}
                themeVariant={isDark ? "dark" : "light"}
              />
            )}
          </View>

          {/* Day Selector */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t("notifications.selectDays")}
            </Text>
            <DaySelector
              selectedDays={notification.days}
              onDaysChange={handleDaysChange}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  } as ViewStyle,
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  } as ViewStyle,
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  } as ViewStyle,
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  } as TextStyle,
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  content: {
    marginTop: 16,
    gap: 16,
  } as ViewStyle,
  section: {
    gap: 8,
  } as ViewStyle,
  label: {
    fontSize: 13,
    fontWeight: "500",
  } as TextStyle,
  timePicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  } as ViewStyle,
  timeText: {
    fontSize: 18,
    fontWeight: "600",
  } as TextStyle,
});

