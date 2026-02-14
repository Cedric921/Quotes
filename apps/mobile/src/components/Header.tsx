import { View, Text, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";

export default function Header() {
  return (
    <BlurView intensity={80} tint="dark" style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Focus</Text>
          <View style={styles.logoDot} />
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
    fontWeight: "700" as const,
    letterSpacing: -0.5,
    color: "#fff",
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 2,
    backgroundColor: "#FF453A",
  },
});
