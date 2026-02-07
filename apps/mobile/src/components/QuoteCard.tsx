import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import { getTopicGradient } from "../constants/colors";

const { height } = Dimensions.get("window");

interface Quote {
  id: number;
  text: string;
  author: string;
  topic?: {
    id: number;
    name: string;
  };
}

interface QuoteCardProps {
  readonly quote: Quote;
  readonly onLike?: (quoteId: number) => void;
  readonly onSave?: (quoteId: number) => void;
  readonly isLiked?: boolean;
  readonly isSaved?: boolean;
}

export default function QuoteCard({
  quote,
  onLike,
  onSave,
  isLiked = false,
  isSaved = false,
}: QuoteCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const [lastTap, setLastTap] = useState(0);

  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const likeButtonScale = useRef(new Animated.Value(1)).current;
  const saveButtonScale = useRef(new Animated.Value(1)).current;

  const gradient = getTopicGradient(quote.topic?.name);

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  // Double tap to like
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      handleLike();
      showHeartAnimation();
    }
    setLastTap(now);
  };

  const showHeartAnimation = () => {
    heartScale.setValue(0);
    heartOpacity.setValue(1);

    Animated.parallel([
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(heartOpacity, {
        toValue: 0,
        duration: 1000,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLiked(!liked);
    onLike?.(quote.id);

    Animated.sequence([
      Animated.timing(likeButtonScale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(likeButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSaved(!saved);
    onSave?.(quote.id);

    Animated.sequence([
      Animated.timing(saveButtonScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(saveButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const shareText = `"${quote.text}"\n\n— ${quote.author}`;

    try {
      if (await Sharing.isAvailableAsync()) {
        // Note: Sharing.shareAsync nécessite un fichier, utilisons plutôt le partage natif
        // Pour l'instant, on simule juste l'action
        console.log("Share:", shareText);
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleDoubleTap}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Double tap heart animation */}
        <Animated.Text
          style={[
            styles.heartAnimation,
            {
              transform: [{ scale: heartScale }],
              opacity: heartOpacity,
            },
          ]}
        >
          ♥
        </Animated.Text>

        <View style={styles.content}>
          <Text style={styles.quoteText}>"{quote.text}"</Text>

          {Boolean(quote.author) && (
            <Text style={styles.author}>— {quote.author}</Text>
          )}
        </View>

        {/* Topic badge with glassmorphism */}
        {quote.topic && (
          <View style={styles.topicBadge}>
            <Text style={styles.topicText}>{quote.topic.name}</Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          {/* Like Button */}
          <Animated.View style={{ transform: [{ scale: likeButtonScale }] }}>
            <TouchableWithoutFeedback onPress={handleLike}>
              <View
                style={[styles.actionButton, liked && styles.likeButtonActive]}
              >
                <Text
                  style={[styles.actionIcon, liked && styles.likeIconActive]}
                >
                  {liked ? "♥" : "♡"}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>

          {/* Save Button */}
          <Animated.View style={{ transform: [{ scale: saveButtonScale }] }}>
            <TouchableWithoutFeedback onPress={handleSave}>
              <View style={styles.actionButton}>
                <Text
                  style={[styles.actionIcon, saved && styles.saveIconActive]}
                >
                  {saved ? "★" : "☆"}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>

          {/* Share Button */}
          <TouchableWithoutFeedback onPress={handleShare}>
            <View style={styles.actionButton}>
              <Text style={styles.actionIcon}>↗</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    height: height,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  heartAnimation: {
    position: "absolute",
    fontSize: 120,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  content: {
    alignItems: "center",
    maxWidth: "100%",
  },
  quoteText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 30,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  author: {
    fontSize: 18,
    color: "#ffffff",
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  topicBadge: {
    position: "absolute",
    top: 100,
    right: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  topicText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionButtons: {
    position: "absolute",
    bottom: 100,
    right: 20,
    gap: 12,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  likeButtonActive: {
    backgroundColor: "#ff4444",
    borderColor: "#ff4444",
  },
  actionIcon: {
    fontSize: 28,
    color: "#ffffff",
    fontWeight: "600",
  },
  likeIconActive: {
    color: "#ffffff",
  },
  saveIconActive: {
    color: "#FFD700",
  },
});
