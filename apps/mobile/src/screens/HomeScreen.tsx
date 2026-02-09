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
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

const { height } = Dimensions.get("window");

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

interface HomeScreenProps {
  readonly navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedQuotes, setLikedQuotes] = useState<Set<number>>(new Set());

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

  const handleShare = useCallback(async (text: string, author: string) => {
    const shareText = `"${text}"\n\n— ${author}\n\n📱 Focus App`;

    if (await Sharing.isAvailableAsync()) {
      // Create a temporary text file to share
      // For now, we'll just log it (you can implement file creation later)
      console.log("Share:", shareText);
    }
  }, []);

  const handleProfile = useCallback(() => {
    navigation.navigate("Profile");
  }, [navigation]);

  const handleSettings = useCallback(() => {
    navigation.navigate("Settings");
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
      <QuoteCard
        quote={item}
        onLike={handleLike}
        isLiked={likedQuotes.has(item.id)}
      />
    ),
    [handleLike, likedQuotes],
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
    <View style={styles.container}>
      {/* Header */}
      <Header />

      {/* Quotes List */}
      <FlatList
        data={quotes}
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
      {quotes.length > 0 && (
        <DotsIndicator total={quotes.length} currentIndex={currentIndex} />
      )}

      {/* Fixed Action Buttons */}
      {quotes.length > 0 && quotes[currentIndex] && (
        <ActionButtons
          quoteId={quotes[currentIndex].id}
          quoteText={quotes[currentIndex].text}
          author={quotes[currentIndex].author}
          isLiked={likedQuotes.has(quotes[currentIndex].id)}
          onLike={handleLike}
          onShare={handleShare}
          onProfile={handleProfile}
          onSettings={handleSettings}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  } as ViewStyle,
  footer: {
    height: height,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
});
