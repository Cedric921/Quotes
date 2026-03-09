import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableWithoutFeedback,
  Animated,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useRef, useEffect, useMemo } from "react";
import * as Haptics from "expo-haptics";

// Helper function to calculate luminance of a color (0 = dark, 1 = light)
function getLuminance(hex: string): number {
  const color = hex.replace("#", "");
  const r = parseInt(color.substring(0, 2), 16) / 255;
  const g = parseInt(color.substring(2, 4), 16) / 255;
  const b = parseInt(color.substring(4, 6), 16) / 255;

  // Convert to sRGB
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

// Check if color is light (needs darker text/overlay)
function isLightColor(hex?: string): boolean {
  if (!hex) return false;
  return getLuminance(hex) > 0.5;
}

// Check if color is very light/white (luminance > 0.85)
function isVeryLightColor(hex?: string): boolean {
  if (!hex) return false;
  return getLuminance(hex) > 0.85;
}

// Helper function to get gradient colors from topic color
function getTopicGradient(color?: string): [string, string, ...string[]] {
  // Default gradient if no color
  if (!color) return ["#667eea", "#764ba2"];

  // If color is very light (white or near-white), use a dark gradient instead
  if (isVeryLightColor(color)) {
    return ["#1a1a2e", "#16213e"];
  }

  // Create a gradient from the base color to a darker variant
  const darkenColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00ff) - amt;
    const B = (num & 0x0000ff) - amt;
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

  // For light colors, darken more aggressively
  const isLight = isLightColor(color);
  const darkenAmount = isLight ? 50 : 30;

  const darkerColor = darkenColor(color, darkenAmount);
  return [color, darkerColor];
}
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAppSelector } from "../store/hooks";

// Map of available system fonts that can be used
const SYSTEM_FONTS: Record<string, string> = {
  // iOS System Fonts
  "San Francisco": "System",
  "SF Pro": "System",
  // Common cross-platform fonts
  Georgia: "Georgia",
  "Times New Roman": "Times New Roman",
  "Courier New": "Courier New",
  Helvetica: "Helvetica",
  Arial: "Arial",
  // Decorative fonts (iOS)
  Papyrus: "Papyrus",
  Copperplate: "Copperplate",
  "American Typewriter": "American Typewriter",
  "Marker Felt": "Marker Felt",
  Zapfino: "Zapfino",
  Didot: "Didot",
  "Bodoni 72": "Bodoni 72",
  Baskerville: "Baskerville",
  Avenir: "Avenir",
  Futura: "Futura",
  Palatino: "Palatino",
  Optima: "Optima",
  "Gill Sans": "Gill Sans",
  "Trebuchet MS": "Trebuchet MS",
  Verdana: "Verdana",
};

interface Quote {
  id: string;
  text: string;
  author: string;
  isLiked?: boolean;
  topic?: {
    id: string;
    name: string;
    color?: string;
  };
}

interface QuoteCardProps {
  readonly quote: Quote;
  readonly onLike: (quoteId: string) => void;
  readonly isLiked?: boolean;
  readonly showTopicName?: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function QuoteCard({
  quote,
  onLike,
  isLiked = false,
  showTopicName = true,
}: QuoteCardProps) {
  const navigation = useNavigation<NavigationProp>();
  const { height, width } = useWindowDimensions();
  const [liked, setLiked] = useState(isLiked);
  const [lastTap, setLastTap] = useState(0);
  const selectedFont = useAppSelector((state) => state.font.selectedFont);
  const backgroundTheme = useAppSelector(
    (state) => state.theme.backgroundTheme,
  );

  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;

  // Get gradient based on topic color
  const gradient = useMemo(
    () => getTopicGradient(quote.topic?.color),
    [quote.topic?.color],
  );

  // Dynamic styles based on screen dimensions
  const dynamicStyles = useMemo(
    () => ({
      container: {
        height: height,
        width: width,
      } as ViewStyle,
      // Responsive font size based on screen width
      quoteText: {
        fontSize: Math.min(Math.max(width * 0.065, 22), 34),
        lineHeight: Math.min(Math.max(width * 0.095, 32), 48),
      } as TextStyle,
      authorText: {
        fontSize: Math.min(Math.max(width * 0.04, 14), 20),
      } as TextStyle,
    }),
    [height, width],
  );

  // Check if a background theme is active (to make card transparent)
  const hasBackgroundTheme = !!backgroundTheme?.imageUrl;

  // Get the effective font family (use system fonts or fallback)
  const effectiveFontFamily = useMemo(() => {
    if (!selectedFont?.fontFamily) return undefined;

    // Check if it's a mapped system font
    const systemFont = SYSTEM_FONTS[selectedFont.fontFamily];
    if (systemFont) return systemFont;

    // Otherwise try to use the font family directly
    // This will work if the font is available on the device
    return selectedFont.fontFamily;
  }, [selectedFont]);

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

  // If background theme is active, use transparent container
  // Otherwise use the dark gradient
  const containerStyle = hasBackgroundTheme
    ? [styles.container, dynamicStyles.container, styles.transparentContainer]
    : [styles.container, dynamicStyles.container];

  const gradientColors: [string, string, ...string[]] = hasBackgroundTheme
    ? ["transparent", "transparent"]
    : gradient;

  return (
    <TouchableWithoutFeedback onPress={handleDoubleTap}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={containerStyle}
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
          <Text
            style={[
              styles.quoteText,
              dynamicStyles.quoteText,
              effectiveFontFamily && {
                fontFamily: effectiveFontFamily,
              },
            ]}
          >
            "{quote.text}"
          </Text>

          {Boolean(quote.author) && (
            <Text
              style={[
                styles.author,
                dynamicStyles.authorText,
                effectiveFontFamily && {
                  fontFamily: effectiveFontFamily,
                },
              ]}
            >
              — {quote.author}
            </Text>
          )}
        </View>

        {/* Topic badge with glassmorphism */}
        {/* {quote.topic && showTopicName && (
          <TouchableOpacity
            style={styles.topicBadge}
            onPress={handleTopicPress}
            activeOpacity={0.7}
          >
            <Text style={styles.topicText}>{quote.topic.name}</Text>
          </TouchableOpacity>
        )} */}
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  } as ViewStyle,
  transparentContainer: {
    backgroundColor: "transparent",
  } as ViewStyle,
  heartAnimation: {
    position: "absolute",
    fontSize: 120,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    zIndex: 10,
  } as TextStyle,
  content: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 8,
    zIndex: 5,
  } as ViewStyle,
  quoteText: {
    fontWeight: "600" as const,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 24,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  } as TextStyle,
  author: {
    color: "#ffffff",
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  } as TextStyle,
  topicBadge: {
    position: "absolute",
    top: 100,
    right: 24,
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
    zIndex: 5,
  } as ViewStyle,
  topicText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600" as const,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  } as TextStyle,
});
