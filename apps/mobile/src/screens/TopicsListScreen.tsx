import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { topicsApi } from "../services/api";
import { Topic } from "../types";
import { LoadingSkeleton } from "../components";

interface TopicsListScreenProps {
  readonly navigation: any;
}

// Topic gradients
const TOPIC_GRADIENTS: Record<string, [string, string, ...string[]]> = {
  default: ["#667eea", "#764ba2"],
  motivation: ["#f093fb", "#f5576c"],
  success: ["#4facfe", "#00f2fe"],
  wisdom: ["#43e97b", "#38f9d7"],
  love: ["#fa709a", "#fee140"],
  life: ["#30cfd0", "#330867"],
  happiness: ["#a8edea", "#fed6e3"],
  inspiration: ["#ff9a9e", "#fecfef"],
  mindfulness: ["#ffecd2", "#fcb69f"],
  growth: ["#ff6e7f", "#bfe9ff"],
};

const getTopicGradient = (
  topicName?: string,
): [string, string, ...string[]] => {
  if (!topicName) return TOPIC_GRADIENTS.default;
  const normalized = topicName.toLowerCase();
  for (const [key, gradient] of Object.entries(TOPIC_GRADIENTS)) {
    if (normalized.includes(key)) {
      return gradient;
    }
  }
  return TOPIC_GRADIENTS.default;
};

export default function TopicsListScreen({
  navigation,
}: TopicsListScreenProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await topicsApi.getTopics();
      setTopics(data);
    } catch (err) {
      setError("Failed to load topics");
      console.error("Error fetching topics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleTopicPress = (topic: Topic) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Topic", {
      topicId: topic.id,
      topicName: topic.name,
    });
  };

  const renderTopicCard = ({ item }: { item: Topic }) => {
    const gradient = getTopicGradient(item.name);

    return (
      <TouchableOpacity
        style={styles.topicCard}
        onPress={() => handleTopicPress(item)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <Text style={styles.topicName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.topicDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color="rgba(255, 255, 255, 0.8)"
          />
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
        <BlurView intensity={80} tint="dark" style={styles.headerBlur}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Topics</Text>
            <View style={styles.placeholder} />
          </View>
        </BlurView>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchTopics()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <BlurView intensity={80} tint="dark" style={styles.headerBlur}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Topics</Text>
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
    color: "#fff",
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
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  } as ViewStyle,
  cardGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    minHeight: 100,
  } as ViewStyle,
  cardContent: {
    flex: 1,
    marginRight: 12,
  } as ViewStyle,
  topicName: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 6,
    letterSpacing: 0.3,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  } as TextStyle,
  topicDescription: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    lineHeight: 20,
    letterSpacing: 0.2,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    color: "#a0a0a0",
    textAlign: "center",
  } as TextStyle,
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#0A84FF",
    borderRadius: 8,
  } as ViewStyle,
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  } as TextStyle,
});
