import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Platform,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { lucideToIonicons } from "../utils/iconMapper";
import Toast from "react-native-toast-message";
import { Topic } from "../types";
import { LoadingSkeleton } from "../components";
import { useAppSelector } from "../store/hooks";
import { useThemeColors } from "../hooks";
import { useTranslation } from "react-i18next";
import { useTopics } from "../api/hooks";

interface TopicsListScreenProps {
  readonly navigation: any;
}

// Helper function to calculate luminance of a color (0 = dark, 1 = light)
const getLuminance = (hex: string): number => {
  const color = hex.replace("#", "");
  const r = parseInt(color.substring(0, 2), 16) / 255;
  const g = parseInt(color.substring(2, 4), 16) / 255;
  const b = parseInt(color.substring(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
};

// Check if color is light (needs dark text)
const isLightColor = (hex?: string): boolean => {
  if (!hex) return false;
  return getLuminance(hex) > 0.5;
};

// Helper function to get gradient colors from topic color
const getTopicGradient = (color?: string): [string, string, ...string[]] => {
  if (!color) return ["#667eea", "#764ba2"];

  // Create a gradient from the base color to a darker/lighter variant
  const lightenColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  };

  const lighterColor = lightenColor(color, 20);
  return [color, lighterColor];
};

export default function TopicsListScreen({
  navigation,
}: TopicsListScreenProps) {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors);

  // Use React Query for topics
  const {
    data: topics = [],
    isLoading: loading,
    isRefetching,
    error,
    refetch,
  } = useTopics();

  const handleRefresh = async () => {
    await refetch();
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleTopicPress = (topic: Topic) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Check if topic is premium and user doesn't have access
    if (
      topic.isPremium &&
      (!isAuthenticated || (!user?.isPremium && !user?.isAdmin))
    ) {
      Toast.show({
        type: "error",
        text1: t("topics.premiumContent"),
        text2: isAuthenticated
          ? t("topics.subscribeToAccess")
          : t("topics.loginToAccess"),
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    navigation.navigate("Topic", {
      topicId: topic.id,
      topicName: topic.name,
    });
  };

  const renderTopicCard = ({ item }: { item: Topic }) => {
    const gradient = getTopicGradient(item.color);
    const iconName = lucideToIonicons(item.icon);
    const isLocked =
      item.isPremium &&
      (!isAuthenticated || (!user?.isPremium && !user?.isAdmin));

    // Check if background is light - use dark text
    const useDarkText = isLightColor(item.color);
    const textColor = useDarkText ? "#1a1a2e" : "#fff";
    const textColorSecondary = useDarkText
      ? "rgba(26, 26, 46, 0.7)"
      : "rgba(255, 255, 255, 0.7)";
    const iconBgColor = useDarkText
      ? "rgba(26, 26, 46, 0.15)"
      : "rgba(255, 255, 255, 0.2)";
    const iconBorderColor = useDarkText
      ? "rgba(26, 26, 46, 0.25)"
      : "rgba(255, 255, 255, 0.3)";

    // Card shadow - darker for light backgrounds
    const cardShadowStyle = useDarkText
      ? { shadowOpacity: 0.4, shadowRadius: 6, elevation: 5 }
      : {};

    // Text shadow - remove for light backgrounds
    const textShadowStyle = useDarkText
      ? { textShadowColor: "transparent", textShadowRadius: 0 }
      : {};

    return (
      <TouchableOpacity
        style={[styles.topicCard, cardShadowStyle]}
        onPress={() => handleTopicPress(item)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Left side: Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: iconBgColor, borderColor: iconBorderColor },
            ]}
          >
            <Ionicons name={iconName} size={22} color={textColor} />
          </View>

          {/* Center: Content */}
          <View style={styles.cardContent}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.topicName,
                  { color: textColor },
                  textShadowStyle,
                ]}
                numberOfLines={1}
              >
                {item.title || item.name}
              </Text>
              {item.isPremium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="diamond" size={10} color="#FFD700" />
                </View>
              )}
            </View>
            {item.description && (
              <Text
                style={[styles.topicDescription, { color: textColor }]}
                numberOfLines={1}
              >
                {item.description}
              </Text>
            )}
          </View>

          {/* Right side: Arrow or Lock */}
          <View style={styles.cardFooter}>
            {isLocked ? (
              <Ionicons
                name="lock-closed"
                size={20}
                color="rgba(255, 215, 0, 0.9)"
              />
            ) : (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={textColorSecondary}
              />
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <BlurView
          intensity={80}
          tint={isDark ? "dark" : "light"}
          style={styles.headerBlur}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Topics</Text>
            <View style={styles.placeholder} />
          </View>
        </BlurView>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
          <Text style={styles.errorText}>
            {error?.message || t("topics.failedToLoad")}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <BlurView
        intensity={80}
        tint={isDark ? "dark" : "light"}
        style={styles.headerBlur}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sujet</Text>
          <View style={styles.placeholder} />
        </View>
      </BlurView>

      {/* Topics List */}
      <FlatList
        data={topics}
        renderItem={renderTopicCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,
    headerBlur: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      overflow: "hidden",
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    } as ViewStyle,
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: Platform.OS === "ios" ? 60 : 40,
      paddingBottom: 16,
    } as ViewStyle,
    backButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    } as ViewStyle,
    headerTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.text,
      letterSpacing: 0.5,
    } as TextStyle,
    placeholder: {
      width: 40,
    } as ViewStyle,
    listContent: {
      paddingTop: Platform.OS === "ios" ? 120 : 100,
      paddingHorizontal: 20,
      paddingBottom: 40,
    } as ViewStyle,
    topicCard: {
      marginBottom: 12,
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3,
    } as ViewStyle,
    cardGradient: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      columnGap: 12,
    } as ViewStyle,
    iconContainer: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: "rgba(255, 255, 255, 0.3)",
    } as ViewStyle,
    cardContent: {
      flex: 1,
      rowGap: 2,
    } as ViewStyle,
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: 6,
    } as ViewStyle,
    topicName: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: "#fff",
      letterSpacing: 0.2,
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    } as TextStyle,
    premiumBadge: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: "rgba(0, 0, 0, 0.25)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255, 215, 0, 0.4)",
    } as ViewStyle,
    topicDescription: {
      fontSize: 12,
      color: "#fff",
      opacity: 0.85,
      lineHeight: 16,
      letterSpacing: 0.1,
    } as TextStyle,
    cardFooter: {
      justifyContent: "center",
      alignItems: "center",
    } as ViewStyle,
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      rowGap: 16,
      paddingHorizontal: 40,
    } as ViewStyle,
    errorText: {
      fontSize: 16,
      color: colors.textTertiary,
      textAlign: "center",
    } as TextStyle,
    retryButton: {
      marginTop: 8,
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: colors.primary,
      borderRadius: 8,
    } as ViewStyle,
    retryButtonText: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: "#fff",
    } as TextStyle,
  });
