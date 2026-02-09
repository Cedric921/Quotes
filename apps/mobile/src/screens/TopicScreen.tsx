import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { Quote } from "../types";
import { quotesService } from "../services/api";
import * as Haptics from "expo-haptics";
import { LoadingSkeleton, ErrorMessage, QuoteCard } from "../components";

interface TopicScreenProps {
  readonly navigation: any;
  readonly route: {
    params: {
      topicId: number;
      topicName: string;
    };
  };
}

export default function TopicScreen({ navigation, route }: TopicScreenProps) {
  const { topicId, topicName } = route.params;
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedQuotes, setLikedQuotes] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchTopicQuotes();
  }, [topicId]);

  const fetchTopicQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quotesService.getAll();
      // Filter quotes by topic
      const topicQuotes = data.filter((q) => q.topic?.id === topicId);
      setQuotes(topicQuotes);
    } catch (err) {
      setError("Failed to load quotes for this topic");
      console.error("Error fetching topic quotes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleLike = (quoteId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLikedQuotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(quoteId)) {
        newSet.delete(quoteId);
      } else {
        newSet.add(quoteId);
      }
      return newSet;
    });
  };

  const renderItem = ({ item }: { item: Quote }) => (
    <QuoteCard
      quote={item}
      onLike={handleLike}
      isLiked={likedQuotes.has(item.id)}
    />
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchTopicQuotes} />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{topicName}</Text>
          <Text style={styles.headerSubtitle}>
            {quotes.length} {quotes.length === 1 ? "quote" : "quotes"}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Quotes List */}
      {quotes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#a0a0a0" />
          <Text style={styles.emptyText}>No quotes found for this topic</Text>
        </View>
      ) : (
        <FlatList
          data={quotes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={600}
          decelerationRate="fast"
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
  headerCenter: {
    flex: 1,
    alignItems: "center",
  } as ViewStyle,
  headerTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#fff",
  } as TextStyle,
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    color: "#a0a0a0",
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
    color: "#a0a0a0",
  } as TextStyle,
});
