import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { getTopicGradient } from "../constants/colors";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function QuoteCard({
  quote,
  onLike,
  isLiked = false,
}: QuoteCardProps) {
  const navigation = useNavigation<NavigationProp>();
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

  const handleTopicPress = () => {
    if (quote.topic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate("Topic", {
        topicId: quote.topic.id,
        topicName: quote.topic.name,
      });
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
          <TouchableOpacity
            style={styles.topicBadge}
            onPress={handleTopicPress}
            activeOpacity={0.7}
          >
            <Text style={styles.topicText}>{quote.topic.name}</Text>
          </TouchableOpacity>
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
  } as ViewStyle,
  heartAnimation: {
    position: "absolute",
    fontSize: 120,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  } as TextStyle,
  content: {
    alignItems: "center",
    maxWidth: "100%",
  } as ViewStyle,
  quoteText: {
    fontSize: 28,
    fontWeight: "600" as const,
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 30,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  } as TextStyle,
  author: {
    fontSize: 18,
    color: "#ffffff",
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  } as TextStyle,
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
  } as ViewStyle,
  topicText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600" as const,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  } as TextStyle,
});
