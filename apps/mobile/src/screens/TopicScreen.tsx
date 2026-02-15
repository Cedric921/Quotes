import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ViewStyle,
  TextStyle,
  Dimensions,
  RefreshControl,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback, useRef, useEffect } from "react";
import { Quote } from "../types";
import * as Haptics from "expo-haptics";
import { LoadingSkeleton, QuoteCard, DotsIndicator } from "../components";
import { BlurView } from "expo-blur";
import { useThemeColors } from "../hooks";
import { useTranslation } from "react-i18next";
import { useQuotesByTopic, useToggleLikeQuote } from "../api/hooks";
import { useQuery } from "@tanstack/react-query";
import { topicsApi } from "../services/api";
import { useAppSelector } from "../store/hooks";
import Toast from "react-native-toast-message";

const { height } = Dimensions.get("window");

interface TopicScreenProps {
  readonly navigation: any;
  readonly route: {
    params: {
      topicId: string;
      topicName: string;
    };
  };
}

export default function TopicScreen({ navigation, route }: TopicScreenProps) {
  const { t } = useTranslation();
  const { topicId, topicName } = route.params;
  const { colors, isDark } = useThemeColors();
  const styles = createStyles(colors);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get user from Redux
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // React Query hooks
  const {
    data: topic,
    isLoading: topicLoading,
    error: topicError,
  } = useQuery({
    queryKey: ["topic", topicId],
    queryFn: () => topicsApi.getTopicById(topicId),
  });

  const {
    data: quotes = [],
    isLoading: quotesLoading,
    isRefetching,
    error: quotesError,
    refetch,
  } = useQuotesByTopic(topicId);

  const toggleLikeMutation = useToggleLikeQuote();

  const isLoading = topicLoading || quotesLoading;
  const error = topicError || quotesError;

  // Check if topic is premium and user doesn't have access
  useEffect(() => {
    if (
      topic &&
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
      // Navigate back after showing the toast
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    }
  }, [topic, isAuthenticated, user, navigation, t]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleLike = useCallback(
    (quoteId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const quote = quotes.find((q) => q.id === quoteId);
      if (!quote) return;

      toggleLikeMutation.mutate({
        quoteId,
        isLiked: quote.isLiked || false,
      });
    },
    [quotes, toggleLikeMutation],
  );

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }, []);

  const renderQuoteCard = ({ item }: { item: Quote }) => (
    <QuoteCard
      quote={item}
      onLike={handleLike}
      isLiked={item.isLiked}
      showTopicName={false}
    />
  );

  if (isLoading && quotes.length === 0 && !error) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("common.error")}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
          <Text style={styles.errorText}>{error?.message}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header avec topic name et quote count */}
      <BlurView
        intensity={80}
        tint={isDark ? "dark" : "light"}
        style={styles.headerBlur}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{topic?.name || topicName}</Text>
            <Text style={styles.headerSubtitle}>
              {quotes.length} {quotes.length === 1 ? "quote" : "quotes"}
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </BlurView>

      {/* Quotes List - Full Screen comme HomeScreen */}
      {quotes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#a0a0a0" />
          <Text style={styles.emptyText}>{t("topics.noQuotesForTopic")}</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={quotes}
            renderItem={renderQuoteCard}
            keyExtractor={(item) => item.id.toString()}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={height}
            snapToAlignment="start"
            decelerationRate="fast"
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                tintColor="#fff"
              />
            }
          />

          {/* Dots Indicator */}
          <DotsIndicator total={quotes.length} currentIndex={currentIndex} />
        </>
      )}
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
    headerCenter: {
      flex: 1,
      alignItems: "center",
    } as ViewStyle,
    headerTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.text,
      letterSpacing: 0.5,
    } as TextStyle,
    headerSubtitle: {
      fontSize: 12,
      fontWeight: "500" as const,
      color: colors.textTertiary,
      marginTop: 2,
      letterSpacing: 0.3,
    } as TextStyle,
    placeholder: {
      width: 40,
    } as ViewStyle,
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      rowGap: 16,
    } as ViewStyle,
    emptyText: {
      fontSize: 16,
      color: colors.textTertiary,
    } as TextStyle,
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
