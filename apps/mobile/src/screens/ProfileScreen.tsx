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

interface ProfileScreenProps {
  readonly navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { colors } = useTheme();

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
          Profile
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="person" size={48} color="#ffffff" />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>User Name</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>
            user@example.com
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <MaterialIcons name="favorite" size={24} color="#ff4444" />
            <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Liked Quotes
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Ionicons name="bookmark" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Saved
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Ionicons name="share-social" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>0</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Shared
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.menuItem,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="edit" size={24} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Edit Profile
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
                name="favorite-border"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                My Favorites
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
              <Ionicons
                name="bookmark-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Saved Quotes
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
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
  } as ViewStyle,
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  } as ViewStyle,
  name: {
    fontSize: 24,
    fontWeight: "600" as const,
    marginBottom: 4,
  } as TextStyle,
  email: {
    fontSize: 14,
  } as TextStyle,
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    columnGap: 12,
    marginBottom: 24,
  } as ViewStyle,
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    rowGap: 8,
  } as ViewStyle,
  statNumber: {
    fontSize: 24,
    fontWeight: "700" as const,
  } as TextStyle,
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  } as TextStyle,
  section: {
    paddingHorizontal: 20,
  } as ViewStyle,
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
});
