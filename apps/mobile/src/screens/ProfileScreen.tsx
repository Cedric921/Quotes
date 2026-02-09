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
import * as Haptics from "expo-haptics";

interface ProfileScreenProps {
  readonly navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={48} color="#ffffff" />
          </View>
          <Text style={styles.name}>User Name</Text>
          <Text style={styles.email}>user@example.com</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="favorite" size={24} color="#ff4444" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Liked Quotes</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="bookmark" size={24} color="#0A84FF" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="share-social" size={24} color="#0A84FF" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Shared</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="edit" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="favorite-border" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>My Favorites</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="bookmark-outline" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>Saved Quotes</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  } as ViewStyle,
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
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
    color: "#fff",
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
    backgroundColor: "#0A84FF",
  } as ViewStyle,
  name: {
    fontSize: 24,
    fontWeight: "600" as const,
    marginBottom: 4,
    color: "#fff",
  } as TextStyle,
  email: {
    fontSize: 14,
    color: "#a0a0a0",
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
    backgroundColor: "#1a1a1a",
  } as ViewStyle,
  statNumber: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#fff",
  } as TextStyle,
  statLabel: {
    fontSize: 12,
    textAlign: "center",
    color: "#a0a0a0",
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
    backgroundColor: "#1a1a1a",
  } as ViewStyle,
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
  } as ViewStyle,
  menuItemText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#fff",
  } as TextStyle,
});
