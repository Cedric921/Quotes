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
    const gradient = getTopicGradient(item.color);
    const iconName = (item.icon || "star") as keyof typeof Ionicons.glyphMap;

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
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name={iconName} size={28} color="#fff" />
            </View>
            {item.isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="diamond" size={14} color="#FFD700" />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            )}
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.topicName}>{item.title || item.name}</Text>
            {item.description && (
              <Text style={styles.topicDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>

          <View style={styles.cardFooter}>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="rgba(255, 255, 255, 0.8)"
            />
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
    padding: 20,
    minHeight: 140,
  } as ViewStyle,
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  } as ViewStyle,
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  } as ViewStyle,
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.5)",
  } as ViewStyle,
  premiumText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#FFD700",
    letterSpacing: 0.5,
  } as TextStyle,
  cardContent: {
    marginBottom: 12,
  } as ViewStyle,
  cardFooter: {
    alignItems: "flex-end",
  } as ViewStyle,
  topicName: {
    fontSize: 22,
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
