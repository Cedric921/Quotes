import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../hooks";
import * as Haptics from "expo-haptics";

interface DaySelectorProps {
  selectedDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  onDaysChange: (days: number[]) => void;
}

const DAYS = [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDays,
  onDaysChange,
}) => {
  const { t } = useTranslation();
  const { colors } = useThemeColors();

  const dayKeys = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const toggleDay = (day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedDays.includes(day)) {
      onDaysChange(selectedDays.filter((d) => d !== day));
    } else {
      onDaysChange([...selectedDays, day].sort());
    }
  };

  const selectPreset = (preset: "everyday" | "weekdays" | "weekends") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switch (preset) {
      case "everyday":
        onDaysChange([0, 1, 2, 3, 4, 5, 6]);
        break;
      case "weekdays":
        onDaysChange([1, 2, 3, 4, 5]);
        break;
      case "weekends":
        onDaysChange([0, 6]);
        break;
    }
  };

  return (
    <View style={styles.container}>
      {/* Preset buttons */}
      <View style={styles.presetContainer}>
        <TouchableOpacity
          style={[
            styles.presetButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => selectPreset("everyday")}
        >
          <Text style={[styles.presetText, { color: colors.textSecondary }]}>
            {t("notifications.days.everyday")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.presetButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => selectPreset("weekdays")}
        >
          <Text style={[styles.presetText, { color: colors.textSecondary }]}>
            {t("notifications.days.weekdays")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.presetButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => selectPreset("weekends")}
        >
          <Text style={[styles.presetText, { color: colors.textSecondary }]}>
            {t("notifications.days.weekends")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Day buttons */}
      <View style={styles.daysContainer}>
        {DAYS.map((day, index) => {
          const isSelected = selectedDays.includes(day);
          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => toggleDay(day)}
            >
              <Text
                style={[
                  styles.dayText,
                  {
                    color: isSelected ? "#FFFFFF" : colors.text,
                    fontWeight: isSelected ? "600" : "400",
                  },
                ]}
              >
                {t(`notifications.days.${dayKeys[index]}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  } as ViewStyle,
  presetContainer: {
    flexDirection: "row",
    gap: 8,
  } as ViewStyle,
  presetButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  } as ViewStyle,
  presetText: {
    fontSize: 12,
    fontWeight: "500",
  } as TextStyle,
  daysContainer: {
    flexDirection: "row",
    gap: 8,
  } as ViewStyle,
  dayButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
  } as ViewStyle,
  dayText: {
    fontSize: 13,
  } as TextStyle,
});

