import { View, Text, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "../contexts/ThemeContext";

export default function Header() {
  const { colors, isDark } = useTheme();

  return (
    <BlurView
      intensity={80}
      tint={isDark ? "dark" : "light"}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={[styles.logo, { color: colors.text }]}>Focus</Text>
          <View style={[styles.logoDot, { backgroundColor: colors.accent }]} />
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 2,
  },
});
