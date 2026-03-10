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
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useState, useMemo } from "react";
import { useAppSelector } from "../store/hooks";
import { useThemeColors } from "../hooks";
import { useTranslation } from "react-i18next";
import { useCurrentUser } from "../api/hooks";
import { useActivityStats } from "../api/hooks/useUserActivity";
import { useUserPayments } from "../api/hooks/useUser";
import { useCurrentSubscription } from "../api/hooks/useSubscriptions";

interface ProfileScreenProps {
  readonly navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.auth.user);
  const { data: freshUserData, refetch, isRefetching } = useCurrentUser();
  const { colors } = useThemeColors();
  const styles = createStyles(colors);

  // Use fresh data from React Query if available, otherwise use Redux state
  const displayUser = freshUserData || user;

  // Get current month and year for activity stats
  const currentDate = new Date();
  const [selectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth] = useState(currentDate.getMonth() + 1);

  // Fetch activity stats for current month
  const token = useAppSelector((state) => state.auth.token);
  const { data: activityStats } = useActivityStats(selectedYear, selectedMonth);

  // Fetch payments and subscription data
  const { data: payments } = useUserPayments();
  const { data: subscription } = useCurrentSubscription();

  // Calculate total spent
  const totalSpent = useMemo(() => {
    return payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
  }, [payments]);

  // Calculate calendar grid
  const calendarDays = useMemo(() => {
    if (!activityStats) return [];

    const activeDates = new Set(
      activityStats.activities.map((a) => a.date.split("T")[0]),
    );
    const days = [];

    for (let day = 1; day <= activityStats.totalDays; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({
        day,
        isActive: activeDates.has(dateStr),
      });
    }

    return days;
  }, [activityStats, selectedYear, selectedMonth]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("profile.title")}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#0A84FF"
          />
        }
      >
        {/* Profile Info */}
        <View style={styles.profileSection}>
          {/* Avatar with gradient background */}
          {displayUser?.avatar ? (
            <Image
              source={{ uri: displayUser.avatar }}
              style={styles.avatarImage}
            />
          ) : (
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {displayUser?.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </LinearGradient>
          )}

          <View style={styles.nameContainer}>
            <Text style={styles.name}>{displayUser?.name || "User"}</Text>
            {displayUser?.isPremium && (
              <Ionicons name="diamond" size={20} color="#FFD700" />
            )}
            {displayUser?.isAdmin && (
              <Ionicons name="shield-checkmark" size={20} color="#FF6B35" />
            )}
          </View>

          <Text style={styles.email}>
            {displayUser?.email || "user@example.com"}
          </Text>

          <View style={styles.badgesContainer}>
            {displayUser?.isAdmin && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#FF6B35" />
                <Text style={styles.adminText}>{t("profile.admin")}</Text>
              </View>
            )}
            {displayUser?.isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="diamond" size={14} color="#FFD700" />
                <Text style={styles.premiumText}>{t("profile.premium")}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("Favorites");
            }}
          >
            <MaterialIcons name="favorite" size={24} color="#ff4444" />
            <Text style={styles.statNumber}>
              {displayUser?.likedQuotesCount || 0}
            </Text>
            <Text style={styles.statLabel}>{t("profile.likedQuotes")}</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.statCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("PaymentHistory");
            }}
          >
            <MaterialIcons
              name="account-balance-wallet"
              size={24}
              color="#34C759"
            />
            <Text style={styles.statNumber}>{totalSpent.toFixed(0)}€</Text>
            <Text style={styles.statLabel}>{t("profile.totalSpent")}</Text>
          </TouchableOpacity> */}

          <View style={styles.statCard}>
            <Ionicons name="diamond" size={24} color="#FFD700" />
            <Text style={styles.statNumber}>
              {subscription?.plan?.name?.charAt(0) || "-"}
            </Text>
            <Text style={styles.statLabel}>{t("profile.subscription")}</Text>
          </View>
        </View>

        {/* Activity Calendar */}
        {token && activityStats && (
          <View style={styles.activitySection}>
            <View style={styles.activityHeader}>
              <Ionicons name="calendar" size={24} color={colors.primary} />
              <Text style={styles.activityTitle}>
                {t("profile.activityCalendar")}
              </Text>
            </View>

            <View style={styles.activityStats}>
              <Text style={styles.activityStatsText}>
                {activityStats.activeDays}/{activityStats.totalDays}{" "}
                {t("profile.daysActive")}
              </Text>
            </View>

            <View style={styles.calendar}>
              {calendarDays.map((dayInfo) => (
                <View
                  key={dayInfo.day}
                  style={[
                    styles.calendarDay,
                    dayInfo.isActive && styles.calendarDayActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      dayInfo.isActive && styles.calendarDayTextActive,
                    ]}
                  >
                    {dayInfo.day}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("EditProfile");
            }}
          >
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="edit" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>
                {t("profile.editProfile")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("Favorites");
            }}
          >
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="favorite-border" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>
                {t("profile.myFavorites")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("PaymentHistory");
            }}
          >
            <View style={styles.menuItemLeft}>
              <MaterialIcons name="receipt-long" size={24} color="#0A84FF" />
              <Text style={styles.menuItemText}>
                {t("profile.paymentHistory")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#a0a0a0" />
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </SafeAreaView>
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
      paddingTop: 10,
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
    badgesContainer: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: 8,
    } as ViewStyle,
    adminBadge: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: "rgba(255, 107, 53, 0.1)",
    } as ViewStyle,
    adminText: {
      fontSize: 12,
      fontWeight: "600" as const,
      color: "#FF6B35",
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
    activitySection: {
      paddingHorizontal: 20,
      marginBottom: 24,
    } as ViewStyle,
    activityHeader: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: 8,
      marginBottom: 12,
    } as ViewStyle,
    activityTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: colors.text,
    } as TextStyle,
    activityStats: {
      backgroundColor: colors.backgroundSecondary,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    } as ViewStyle,
    activityStatsText: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: colors.primary,
      textAlign: "center",
    } as TextStyle,
    calendar: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      backgroundColor: colors.backgroundSecondary,
      padding: 12,
      borderRadius: 12,
    } as ViewStyle,
    calendarDay: {
      width: 36,
      height: 36,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,
    calendarDayActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    } as ViewStyle,
    calendarDayText: {
      fontSize: 12,
      fontWeight: "500" as const,
      color: colors.textTertiary,
    } as TextStyle,
    calendarDayTextActive: {
      color: "#fff",
      fontWeight: "700" as const,
    } as TextStyle,
  });
