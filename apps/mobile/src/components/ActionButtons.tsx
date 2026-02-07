import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useState, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

interface ActionButtonsProps {
  quoteId: number;
  quoteText: string;
  author: string;
  isLiked?: boolean;
  onLike: (quoteId: number) => void;
  onShare: (text: string, author: string) => void;
  onProfile: () => void;
  onSettings: () => void;
}

export default function ActionButtons({
  quoteId,
  quoteText,
  author,
  isLiked = false,
  onLike,
  onShare,
  onProfile,
  onSettings,
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

  const handleProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onProfile();
  };

  const handleSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSettings();
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

  const profileTranslate = menuAnimation.interpolate({
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

        {/* Profile Button - Animated */}
        <Animated.View
          style={[
            styles.animatedButton,
            {
              transform: [{ translateY: profileTranslate }],
              opacity: buttonOpacity,
            },
          ]}
          pointerEvents={isOpen ? "auto" : "none"}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={handleProfile}
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

      {/* Left Side Settings Button */}
      <View style={styles.leftContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSettings}
          activeOpacity={0.8}
        >
          <Ionicons name="settings-outline" size={26} color="#ffffff" />
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
  },
  leftContainer: {
    position: "absolute",
    bottom: 80,
    left: 20,
    zIndex: 1000,
  },
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
  },
  animatedButton: {
    position: "absolute",
    bottom: 0,
  },
  toggleButton: {
    backgroundColor: "rgba(100, 100, 255, 0.4)",
    borderColor: "rgba(100, 100, 255, 0.5)",
  },
  likeButtonActive: {
    backgroundColor: "rgba(255, 68, 68, 0.2)",
    borderColor: "#ff4444",
    shadowColor: "#ff4444",
    shadowOpacity: 0.6,
  },
});
