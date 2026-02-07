import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import * as Haptics from "expo-haptics";

interface SettingsScreenProps {
  readonly navigation: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { theme, toggleTheme, colors } = useTheme();

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleTheme();
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Settings
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            APPEARANCE
          </Text>

          <TouchableOpacity
            style={[
              styles.menuItem,
              { backgroundColor: colors.cardBackground },
            ]}
            onPress={handleThemeToggle}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons
                name={theme === "dark" ? "moon" : "sunny"}
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Theme
              </Text>
            </View>
            <Text
              style={[styles.menuItemValue, { color: colors.textSecondary }]}
            >
              {theme === "dark" ? "Dark" : "Light"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            NOTIFICATIONS
          </Text>

          <TouchableOpacity
            style={[
              styles.menuItem,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Push Notifications
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ABOUT
          </Text>

          <TouchableOpacity
            style={[
              styles.menuItem,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.menuItemLeft}>
              <MaterialIcons
                name="info-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                About Focus
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.menuItemLeft}>
              <MaterialIcons
                name="privacy-tip"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Privacy Policy
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  } as ViewStyle,
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  headerTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
  } as TextStyle,
  placeholder: {
    width: 40,
  } as ViewStyle,
  content: {
    flex: 1,
  } as ViewStyle,
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    marginBottom: 12,
    letterSpacing: 0.5,
  } as TextStyle,
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  } as ViewStyle,
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
  } as ViewStyle,
  menuItemText: {
    fontSize: 16,
    fontWeight: "500" as const,
  } as TextStyle,
  menuItemValue: {
    fontSize: 14,
  } as TextStyle,
});
