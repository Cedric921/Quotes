// Couleurs du thème
export const COLORS = {
  light: {
    background: "#FFFFFF",
    cardBackground: "#F5F5F5",
    text: "#000000",
    textSecondary: "#666666",
    primary: "#007AFF",
    accent: "#FF3B30",
    border: "#E5E5E5",
    shadow: "rgba(0, 0, 0, 0.1)",
  },
  dark: {
    background: "#000000",
    cardBackground: "#1a1a1a",
    text: "#FFFFFF",
    textSecondary: "#a0a0a0",
    primary: "#0A84FF",
    accent: "#FF453A",
    border: "#333333",
    shadow: "rgba(255, 255, 255, 0.1)",
  },
};

// Gradients par topic (comme dans l'admin)
export const TOPIC_GRADIENTS = {
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

// Fonction pour obtenir le gradient d'un topic
export function getTopicGradient(
  topicName?: string,
): [string, string, ...string[]] {
  if (!topicName) return TOPIC_GRADIENTS.default;

  const normalized = topicName.toLowerCase();

  for (const [key, gradient] of Object.entries(TOPIC_GRADIENTS)) {
    if (normalized.includes(key)) {
      return gradient as [string, string, ...string[]];
    }
  }

  return TOPIC_GRADIENTS.default;
}
