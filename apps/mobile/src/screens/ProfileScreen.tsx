import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  TextStyle,
  Image,
  ImageStyle,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

interface ProfileScreenProps {
  readonly navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("profile.title")}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          {/* Avatar with gradient background */}
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
          ) : (
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </LinearGradient>
          )}

          <View style={styles.nameContainer}>
            <Text style={styles.name}>{user?.name || "User"}</Text>
            {user?.isPremium && (
              <Ionicons name="diamond" size={20} color="#FFD700" />
            )}
          </View>

          <Text style={styles.email}>{user?.email || "user@example.com"}</Text>

          {user?.isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond" size={14} color="#FFD700" />
              <Text style={styles.premiumText}>{t("profile.premium")}</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="favorite" size={24} color="#ff4444" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>{t("profile.likedQuotes")}</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="bookmark" size={24} color="#0A84FF" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>{t("profile.saved")}</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="share-social" size={24} color="#0A84FF" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>{t("profile.shared")}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="edit" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>
                {t("profile.editProfile")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="favorite-border" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>
                {t("profile.myFavorites")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="bookmark-outline" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>
                {t("profile.savedQuotes")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
      color: colors.text,
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
    avatarImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 16,
    } as ImageStyle,
    avatarText: {
      fontSize: 40,
      fontWeight: "700" as const,
      color: "#fff",
    } as TextStyle,
    nameContainer: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: 8,
      marginBottom: 4,
    } as ViewStyle,
    name: {
      fontSize: 24,
      fontWeight: "600" as const,
      color: colors.text,
    } as TextStyle,
    email: {
      fontSize: 14,
      marginBottom: 12,
      color: colors.textTertiary,
    } as TextStyle,
    premiumBadge: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: "rgba(255, 215, 0, 0.1)",
    } as ViewStyle,
    premiumText: {
      fontSize: 12,
      fontWeight: "600" as const,
      color: "#FFD700",
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
      backgroundColor: colors.backgroundSecondary,
    } as ViewStyle,
    statNumber: {
      fontSize: 24,
      fontWeight: "700" as const,
      color: colors.text,
    } as TextStyle,
    statLabel: {
      fontSize: 12,
      textAlign: "center",
      color: colors.textTertiary,
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
      backgroundColor: colors.backgroundSecondary,
    } as ViewStyle,
    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: 12,
    } as ViewStyle,
    menuItemText: {
      fontSize: 16,
      fontWeight: "500" as const,
      color: colors.text,
    } as TextStyle,
  });
