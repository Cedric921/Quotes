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
  readonly onLike: (quoteId: number) => void;
  readonly isLiked?: boolean;
}

export default function QuoteCard({
  quote,
  onLike,
  isLiked = false,
}: QuoteCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [lastTap, setLastTap] = useState(0);

  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;

  const gradient = getTopicGradient(quote.topic?.name);

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

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
    onLike(quote.id);
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
});
