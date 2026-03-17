import { View, StyleSheet, Platform, Image } from "react-native";
import { BlurView } from "expo-blur";

export default function Header() {
  return (
    <BlurView intensity={80} tint="dark" style={styles.container}>
      <View style={styles.content}>
        {/* Logo - Aligned to the left */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/logo_home.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
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
    justifyContent: "flex-start",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 80,
    height: 32,
  },
});
