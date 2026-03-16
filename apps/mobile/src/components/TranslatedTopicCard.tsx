import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslatedTopic } from "../hooks";
import { Topic } from "../types";
import { lucideToIonicons } from "../utils/iconMapper";

interface TranslatedTopicCardProps {
  readonly topic: Topic;
  readonly onPress: () => void;
  readonly isLocked: boolean;
}

// Helper function to calculate luminance of a color
const getLuminance = (hex: string): number => {
  const color = hex.replace("#", "");
  const r = parseInt(color.substring(0, 2), 16) / 255;
  const g = parseInt(color.substring(2, 4), 16) / 255;
  const b = parseInt(color.substring(4, 6), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
};

const isLightColor = (hex?: string): boolean => {
  if (!hex) return false;
  return getLuminance(hex) > 0.5;
};

const getTopicGradient = (color?: string): [string, string, ...string[]] => {
  if (!color) return ["#667eea", "#764ba2"];
  const lightenColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      "#" +
      (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1)
    );
  };
  const lighterColor = lightenColor(color, 20);
  return [color, lighterColor];
};

export default function TranslatedTopicCard({ topic, onPress, isLocked }: TranslatedTopicCardProps) {
  const { translatedTitle, translatedDescription, isTranslating } = useTranslatedTopic(topic);
  
  const gradient = getTopicGradient(topic.color);
  const iconName = lucideToIonicons(topic.icon);
  const useDarkText = isLightColor(topic.color);
  const textColor = useDarkText ? "#1a1a2e" : "#fff";
  const textColorSecondary = useDarkText ? "rgba(26, 26, 46, 0.7)" : "rgba(255, 255, 255, 0.7)";
  const iconBgColor = useDarkText ? "rgba(26, 26, 46, 0.15)" : "rgba(255, 255, 255, 0.2)";
  const iconBorderColor = useDarkText ? "rgba(26, 26, 46, 0.25)" : "rgba(255, 255, 255, 0.3)";
  const cardShadowStyle = useDarkText ? { shadowOpacity: 0.4, shadowRadius: 6, elevation: 5 } : {};
  const textShadowStyle = useDarkText ? { textShadowColor: "transparent", textShadowRadius: 0 } : {};

  return (
    <TouchableOpacity style={[styles.topicCard, cardShadowStyle]} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardGradient}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor, borderColor: iconBorderColor }]}>
          <Ionicons name={iconName} size={22} color={textColor} />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={[styles.topicName, { color: textColor }, textShadowStyle]} numberOfLines={1}>
              {translatedTitle}
            </Text>
            {isTranslating && (
              <ActivityIndicator size="small" color={textColorSecondary} style={styles.loadingIndicator} />
            )}
            {topic.isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="diamond" size={10} color="#FFD700" />
              </View>
            )}
          </View>
          {translatedDescription && (
            <Text style={[styles.topicDescription, { color: textColor }]} numberOfLines={1}>
              {translatedDescription}
            </Text>
          )}
        </View>
        <View style={styles.cardFooter}>
          {isLocked ? (
            <Ionicons name="lock-closed" size={20} color="rgba(255, 215, 0, 0.9)" />
          ) : (
            <Ionicons name="chevron-forward" size={20} color={textColorSecondary} />
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  topicCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,
  cardGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    columnGap: 12,
  } as ViewStyle,
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  } as ViewStyle,
  cardContent: { flex: 1, rowGap: 2 } as ViewStyle,
  titleRow: { flexDirection: "row", alignItems: "center", columnGap: 6 } as ViewStyle,
  topicName: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  } as TextStyle,
  loadingIndicator: { marginLeft: 4 } as ViewStyle,
  premiumBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.4)",
  } as ViewStyle,
  topicDescription: { fontSize: 12, opacity: 0.85, lineHeight: 16, letterSpacing: 0.1 } as TextStyle,
  cardFooter: { justifyContent: "center", alignItems: "center" } as ViewStyle,
});

