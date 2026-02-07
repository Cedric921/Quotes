import { useEffect, useCallback, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import {
  QuoteCard,
  LoadingSkeleton,
  ErrorMessage,
  Header,
  DotsIndicator,
} from "../components";
import { useQuotes } from "../hooks";
import { Quote } from "../types";
import { useTheme } from "../contexts/ThemeContext";

const { height } = Dimensions.get("window");

export default function HomeScreen() {
  const { colors, toggleTheme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedQuotes, setLikedQuotes] = useState<Set<number>>(new Set());
  const [savedQuotes, setSavedQuotes] = useState<Set<number>>(new Set());

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

  const handleRetry = useCallback(() => {
    fetchQuotes(1, true);
  }, [fetchQuotes]);

  const handleLike = useCallback(
    (quoteId: number) => {
      setLikedQuotes((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(quoteId)) {
          newSet.delete(quoteId);
        } else {
          newSet.add(quoteId);
        }
        return newSet;
      });
      likeQuote(quoteId);
    },
    [likeQuote],
  );

  const handleSave = useCallback((quoteId: number) => {
    setSavedQuotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(quoteId)) {
        newSet.delete(quoteId);
      } else {
        newSet.add(quoteId);
      }
      return newSet;
    });
    // TODO: Implement save to local storage
  }, []);

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
      <QuoteCard
        quote={item}
        onLike={handleLike}
        onSave={handleSave}
        isLiked={likedQuotes.has(item.id)}
        isSaved={savedQuotes.has(item.id)}
      />
    ),
    [handleLike, handleSave, likedQuotes, savedQuotes],
  );

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }, [loading, colors.primary]);

  // Show loading skeleton on initial load
  if (loading && quotes.length === 0 && !error) {
    return <LoadingSkeleton />;
  }

  // Show error message if there's an error and no quotes
  if (error && quotes.length === 0) {
    return (
      <ErrorMessage
        message="Impossible de charger les citations. Vérifiez votre connexion."
        onRetry={handleRetry}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Header onThemeToggle={toggleTheme} />

      {/* Quotes List */}
      <FlatList
        data={quotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
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
      {quotes.length > 0 && (
        <DotsIndicator total={quotes.length} currentIndex={currentIndex} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
});
