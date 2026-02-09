import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

interface ActionButtonsProps {
  readonly quoteId: number;
  readonly quoteText: string;
  readonly author: string;
  readonly isLiked?: boolean;
  readonly onLike: (quoteId: number) => void;
  readonly onShare: (text: string, author: string) => void;
  readonly onSettings: () => void;
  readonly onTopics: () => void;
}

export default function ActionButtons({
  quoteId,
  quoteText,
  author,
  isLiked = false,
  onLike,
  onShare,
  onSettings,
  onTopics,
}: ActionButtonsProps) {
  const [liked, setLiked] = useState(isLiked);
  const [isOpen, setIsOpen] = useState(false);

  const likeScale = useRef(new Animated.Value(1)).current;
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLiked(!liked);
    onLike(quoteId);

    // Animation
    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(likeScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShare(quoteText, author);
  };

  const handleSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSettings();
  };

  const handleTopics = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTopics();
  };

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.parallel([
      Animated.spring(menuAnimation, {
        toValue,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(rotateAnimation, {
        toValue,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();

    setIsOpen(!isOpen);
  };

  const rotate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const likeTranslate = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  });

  const shareTranslate = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -160],
  });

  const settingsTranslate = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -240],
  });

  const buttonOpacity = menuAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  return (
    <>
      {/* Right Side Buttons */}
      <View style={styles.rightContainer}>
        {/* Like Button - Animated */}
        <Animated.View
          style={[
            styles.animatedButton,
            {
              transform: [{ translateY: likeTranslate }, { scale: likeScale }],
              opacity: buttonOpacity,
            },
          ]}
          pointerEvents={isOpen ? "auto" : "none"}
        >
          <TouchableOpacity
            style={[styles.button, liked && styles.likeButtonActive]}
            onPress={handleLike}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={liked ? "favorite" : "favorite-border"}
              size={28}
              color={liked ? "#ff4444" : "#ffffff"}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Share Button - Animated */}
        <Animated.View
          style={[
            styles.animatedButton,
            {
              transform: [{ translateY: shareTranslate }],
              opacity: buttonOpacity,
            },
          ]}
          pointerEvents={isOpen ? "auto" : "none"}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Ionicons name="share-outline" size={26} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>

        {/* Settings Button (User Menu) - Animated */}
        <Animated.View
          style={[
            styles.animatedButton,
            {
              transform: [{ translateY: settingsTranslate }],
              opacity: buttonOpacity,
            },
          ]}
          pointerEvents={isOpen ? "auto" : "none"}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={handleSettings}
            activeOpacity={0.8}
          >
            <MaterialIcons name="person-outline" size={28} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>

        {/* Toggle Menu Button (+ / X) */}
        <TouchableOpacity
          style={[styles.button, styles.toggleButton]}
          onPress={toggleMenu}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="add" size={32} color="#ffffff" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Left Side Topics Button */}
      <View style={styles.leftContainer}>
        <TouchableOpacity
          style={styles.topicsButton}
          onPress={handleTopics}
          activeOpacity={0.8}
        >
          <Ionicons name="grid-outline" size={22} color="#ffffff" />
          <Text style={styles.topicsText}>Topics</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  rightContainer: {
    position: "absolute",
    bottom: 80,
    right: 20,
    zIndex: 1000,
  } as ViewStyle,
  leftContainer: {
    position: "absolute",
    bottom: 80,
    left: 20,
    zIndex: 1000,
  } as ViewStyle,
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.35)",
    // Ombres plus prononcées
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  } as ViewStyle,
  animatedButton: {
    position: "absolute",
    bottom: 0,
  } as ViewStyle,
  toggleButton: {
    backgroundColor: "rgba(100, 100, 255, 0.4)",
    borderColor: "rgba(100, 100, 255, 0.5)",
  } as ViewStyle,
  likeButtonActive: {
    backgroundColor: "rgba(255, 68, 68, 0.2)",
    borderColor: "#ff4444",
    shadowColor: "#ff4444",
    shadowOpacity: 0.6,
  } as ViewStyle,
  topicsButton: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.35)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  } as ViewStyle,
  topicsText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#ffffff",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  } as TextStyle,
});
