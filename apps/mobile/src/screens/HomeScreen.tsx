import { useEffect, useCallback, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import * as Sharing from "expo-sharing";
import {
  QuoteCard,
  LoadingSkeleton,
  ErrorMessage,
  Header,
  DotsIndicator,
  ActionButtons,
} from "../components";
import { useQuotes } from "../hooks";
import { Quote } from "../types";
import { quotesApi } from "../services/api";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";

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
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [currentIndex, setCurrentIndex] = useState(0);

  const {
    quotes,
    loading,
    refreshing,
    error,
    loadMore,
    refresh,
    likeQuote,
    fetchQuotes,
  } = useQuotes({ pageSize: 10 });

  useEffect(() => {
    fetchQuotes(1, true);
  }, []);

  // Filter out quotes from premium topics if user is not authenticated or not premium
  const filteredQuotes = quotes.filter((quote) => {
    // If topic is not premium, show it
    if (!quote.topic?.isPremium) return true;

    // If topic is premium, only show if user is authenticated AND premium
    return isAuthenticated && user?.isPremium;
  });

  const handleRetry = useCallback(() => {
    fetchQuotes(1, true);
  }, [fetchQuotes]);

  const handleLike = useCallback(
    async (quoteId: string) => {
      // Optimistically update the quote in the list
      const quote = quotes.find((q) => q.id === quoteId);
      if (!quote) return;

      const isCurrentlyLiked = quote.isLiked;

      try {
        if (isCurrentlyLiked) {
          await quotesApi.unlikeQuote(quoteId);
        } else {
          await quotesApi.likeQuote(quoteId);
        }
        // Refresh to get updated state from server
        refresh();
        // Refresh user data to update liked quotes count
        refreshUser();
      } catch (error) {
        console.error("Error toggling like:", error);
      }
    },
    [quotes, refresh, refreshUser],
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

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const renderItem = useCallback(
    ({ item }: { item: Quote }) => (
      <QuoteCard quote={item} onLike={handleLike} isLiked={item.isLiked} />
    ),
    [handleLike],
  );

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }, [loading]);

  // Show loading skeleton on initial load
  if (loading && filteredQuotes.length === 0 && !error) {
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header />

      {/* Quotes List */}
      <FlatList
        data={filteredQuotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
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
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,
    footer: {
      height: height,
      justifyContent: "center",
      alignItems: "center",
    } as ViewStyle,
  });
