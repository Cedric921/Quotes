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
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { Topic } from "../types";
import { LoadingSkeleton, TranslatedTopicCard } from "../components";
import { useAppSelector } from "../store/hooks";
import { useThemeColors } from "../hooks";
import { useTranslation } from "react-i18next";
import { useTopics } from "../api/hooks";

interface TopicsListScreenProps {
  readonly navigation: any;
}

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
    const isLocked = !!(
      item.isPremium &&
      (!isAuthenticated || (!user?.isPremium && !user?.isAdmin))
    );

    return (
      <TranslatedTopicCard
        topic={item}
        onPress={() => handleTopicPress(item)}
        isLocked={isLocked}
      />
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
