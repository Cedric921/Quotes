import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  Platform,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

interface ActionButtonsProps {
  readonly quoteId: string;
  readonly isLiked?: boolean;
  readonly isAuthenticated?: boolean;
  readonly onLike: (quoteId: string) => void;
  readonly onSettings: () => void;
  readonly onTopics: () => void;
  readonly onLogin?: () => void;
}

export default function ActionButtons({
  quoteId,
  isLiked = false,
  isAuthenticated = false,
  onLike,
  onSettings,
  onTopics,
  onLogin,
}: ActionButtonsProps) {
  const [liked, setLiked] = useState(isLiked);
  const likeScale = useRef(new Animated.Value(1)).current;

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

  const handleSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSettings();
  };

  const handleTopics = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTopics();
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLogin?.();
  };

  // Glass button component with liquid glass effect
  const GlassButton = ({
    onPress,
    children,
    isActive = false,
    size = 48,
  }: {
    onPress: () => void;
    children: React.ReactNode;
    isActive?: boolean;
    size?: number;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.glassButtonOuter,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <BlurView
        intensity={80}
        tint="dark"
        style={[styles.glassButtonBlur, { borderRadius: size / 2 }]}
      >
        <View
          style={[
            styles.glassButtonInner,
            { borderRadius: size / 2 },
            isActive && styles.glassButtonInnerActive,
          ]}
        >
          {children}
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  // If not authenticated: show only Topics and User (login) buttons
  if (!isAuthenticated) {
    return (
      <View style={styles.bottomContainer}>
        <View style={styles.buttonRow}>
          {/* Topics Button */}
          <GlassButton onPress={handleTopics}>
            <Ionicons name="grid-outline" size={26} color="#ffffff" />
          </GlassButton>

          {/* User/Login Button */}
          <GlassButton onPress={handleLogin} isActive>
            <MaterialIcons name="person-outline" size={26} color="#ffffff" />
          </GlassButton>
        </View>
      </View>
    );
  }

  // If authenticated: show Topics, Like, and User buttons
  return (
    <View style={styles.bottomContainer}>
      <View style={styles.buttonRow}>
        {/* Topics Button */}
        <GlassButton onPress={handleTopics}>
          <Ionicons name="grid-outline" size={26} color="#ffffff" />
        </GlassButton>

        {/* Like Button (center, slightly larger) */}
        <Animated.View style={{ transform: [{ scale: likeScale }] }}>
          <TouchableOpacity
            onPress={handleLike}
            activeOpacity={0.7}
            style={[styles.glassButtonOuter, styles.likeButtonOuter]}
          >
            <BlurView
              intensity={80}
              tint="systemMaterialDark"
              style={[
                styles.glassButtonBlur,
                styles.likeButtonBlur,
                liked && styles.likeButtonBlurActive,
              ]}
            >
              <View
                style={[
                  styles.glassButtonInner,
                  styles.likeButtonInner,
                  liked && styles.likeButtonInnerActive,
                ]}
              >
                <MaterialIcons
                  name={liked ? "favorite" : "favorite-border"}
                  size={26}
                  color={liked ? "#ff4444" : "#ffffff"}
                />
              </View>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>

        {/* User/Settings Button */}
        <GlassButton onPress={handleSettings}>
          <MaterialIcons name="person-outline" size={26} color="#ffffff" />
        </GlassButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 40 : 24,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  } as ViewStyle,
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  } as ViewStyle,
  glassButtonOuter: {
    // Outer shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  } as ViewStyle,
  glassButtonBlur: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    // Outer glass border
    // borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.40)",
  } as ViewStyle,
  glassButtonInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    // Liquid glass fill - translucent white
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  } as ViewStyle,
  glassButtonInnerActive: {
    backgroundColor: "rgba(100, 100, 255, 0.3)",
  } as ViewStyle,
  // Like button (slightly larger)
  likeButtonOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
  } as ViewStyle,
  likeButtonBlur: {
    borderRadius: 28,
  } as ViewStyle,
  likeButtonBlurActive: {
    borderColor: "rgba(255, 68, 68, 0.5)",
  } as ViewStyle,
  likeButtonInner: {
    borderRadius: 28,
  } as ViewStyle,
  likeButtonInnerActive: {
    backgroundColor: "rgba(255, 68, 68, 0.3)",
  } as ViewStyle,
});
