import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  ViewStyle,
  ImageBackground,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import * as Sharing from "expo-sharing";
import {
  QuoteCard,
  LoadingSkeleton,
  ErrorMessage,
  Header,
  DotsIndicator,
  ActionButtons,
} from "../components";
import { useQuotes, useToggleLikeQuote } from "../api/hooks";
import { Quote } from "../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAppSelector } from "../store/hooks";
import { useThemeColors } from "../hooks";
import { useTranslation } from "react-i18next";
import { widgetService } from "../services/widgetService";

const { height } = Dimensions.get("window");

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

interface HomeScreenProps {
  readonly navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const backgroundTheme = useAppSelector(
    (state) => state.theme.backgroundTheme,
  );
  const { colors } = useThemeColors();
  const styles = createStyles(colors);
  const [currentIndex, setCurrentIndex] = useState(0);

  // React Query hooks
  const {
    data,
    isLoading,
    isRefetching,
    error,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useQuotes(10);

  const toggleLikeMutation = useToggleLikeQuote();

  // Flatten pages into a single array of quotes
  const quotes = useMemo(() => {
    return data?.pages.flat() || [];
  }, [data]);

  // Filter out quotes from premium topics if user is not authenticated or not premium/admin
  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      // If topic is not premium, show it
      if (!quote.topic?.isPremium) return true;

      // If topic is premium, only show if user is authenticated AND (premium OR admin)
      return isAuthenticated && (user?.isPremium || user?.isAdmin);
    });
  }, [quotes, isAuthenticated, user]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLike = useCallback(
    (quoteId: string) => {
      const quote = quotes.find((q) => q.id === quoteId);
      if (!quote) return;

      toggleLikeMutation.mutate({
        quoteId,
        isLiked: quote.isLiked || false,
      });
    },
    [quotes, toggleLikeMutation],
  );

  const handleShare = useCallback(async (text: string, author: string) => {
    const shareText = `"${text}"\n\n— ${author}\n\n📱 Focus App`;

    if (await Sharing.isAvailableAsync()) {
      // Create a temporary text file to share
      // For now, we'll just log it (you can implement file creation later)
      console.log("Share:", shareText);
    }
  }, []);

  const handleSettings = useCallback(() => {
    navigation.navigate("Settings");
  }, [navigation]);

  const handleTopics = useCallback(() => {
    navigation.navigate("Topics");
  }, [navigation]);

  const handleLogin = useCallback(() => {
    navigation.navigate("Login");
  }, [navigation]);

  const lastWidgetUpdateRef = useRef<string | null>(null);

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  // Update widget when current quote changes
  useEffect(() => {
    const currentQuote = filteredQuotes[currentIndex];
    if (currentQuote && currentQuote.id !== lastWidgetUpdateRef.current) {
      lastWidgetUpdateRef.current = currentQuote.id;
      widgetService.updateWidgetQuote({
        content: currentQuote.text,
        author: currentQuote.author,
        topicName: currentQuote.topic?.name,
      });
    }
  }, [currentIndex, filteredQuotes]);

  const renderItem = useCallback(
    ({ item }: { item: Quote }) => (
      <QuoteCard quote={item} onLike={handleLike} isLiked={item.isLiked} />
    ),
    [handleLike],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isLoading && !isRefetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isLoading, isRefetching, fetchNextPage]);

  const renderFooter = useCallback(() => {
    if (!isLoading && !isRefetching) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }, [isLoading, isRefetching, styles.footer]);

  // Show loading skeleton on initial load
  if (isLoading && filteredQuotes.length === 0 && !error) {
    return <LoadingSkeleton />;
  }

  // Show error message if there's an error and no quotes
  if (error && filteredQuotes.length === 0) {
    return (
      <ErrorMessage
        message={t("errors.failedToLoadQuotes")}
        onRetry={handleRetry}
      />
    );
  }

  const content = (
    <>
      {/* Header */}
      <Header />

      {/* Quotes List */}
      <FlatList
        data={filteredQuotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#0A84FF"
          />
        }
        ListFooterComponent={renderFooter}
        getItemLayout={(_data, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />

      {/* Dots Indicator */}
      {filteredQuotes.length > 0 && (
        <DotsIndicator
          total={filteredQuotes.length}
          currentIndex={currentIndex}
        />
      )}

      {/* Fixed Action Buttons */}
      {filteredQuotes.length > 0 && filteredQuotes[currentIndex] && (
        <ActionButtons
          quoteId={filteredQuotes[currentIndex].id}
          quoteText={filteredQuotes[currentIndex].text}
          author={filteredQuotes[currentIndex].author}
          isLiked={filteredQuotes[currentIndex].isLiked}
          isAuthenticated={isAuthenticated}
          onLike={handleLike}
          onShare={handleShare}
          onSettings={handleSettings}
          onTopics={handleTopics}
          onLogin={handleLogin}
        />
      )}
    </>
  );

  // If a background theme is selected, wrap content in ImageBackground with glass effect
  if (backgroundTheme?.imageUrl) {
    return (
      <ImageBackground
        source={{ uri: backgroundTheme.imageUrl }}
        style={styles.container}
        resizeMode="cover"
      >
        {/* Glass effect overlay using BlurView */}
        <BlurView intensity={4} tint="dark" style={styles.glassOverlay}>
          <View style={styles.glassInner}>{content}</View>
        </BlurView>
      </ImageBackground>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,
    glassOverlay: {
      flex: 1,
    } as ViewStyle,
    glassInner: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.1)",
    } as ViewStyle,
    footer: {
      height: height,
      justifyContent: "center",
      alignItems: "center",
    } as ViewStyle,
  });
