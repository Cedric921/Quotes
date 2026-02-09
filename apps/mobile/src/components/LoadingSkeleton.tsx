import { View, StyleSheet, Dimensions, Animated } from "react-native";
import { useEffect, useRef } from "react";

const { height } = Dimensions.get("window");

export default function LoadingSkeleton() {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      {/* Logo animé */}
      <Animated.View style={[styles.logoContainer, { opacity }]}>
        <View style={styles.logoCircle}>
          <View style={styles.logoText}>
            <View style={styles.logoLine} />
            <View style={[styles.logoLine, styles.logoLineShort]} />
          </View>
        </View>
      </Animated.View>

      {/* Skeleton de la citation */}
      <View style={styles.skeletonContent}>
        <Animated.View
          style={[styles.skeletonLine, styles.skeletonLineLong, { opacity }]}
        />
        <Animated.View
          style={[styles.skeletonLine, styles.skeletonLineMedium, { opacity }]}
        />
        <Animated.View
          style={[styles.skeletonLine, styles.skeletonLineShort, { opacity }]}
        />

        {/* Author skeleton */}
        <Animated.View style={[styles.authorSkeleton, { opacity }]} />
      </View>

      {/* Badge skeleton */}
      <Animated.View style={[styles.badgeSkeleton, { opacity }]} />

      {/* Buttons skeleton */}
      <View style={styles.buttonsSkeleton}>
        {[1, 2, 3].map((i) => (
          <Animated.View key={i} style={[styles.buttonSkeleton, { opacity }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    backgroundColor: "#000",
  },
  logoContainer: {
    marginBottom: 60,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  logoText: {
    gap: 8,
  },
  logoLine: {
    height: 4,
    width: 40,
    borderRadius: 2,
    backgroundColor: "#333",
  },
  logoLineShort: {
    width: 28,
  },
  skeletonContent: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  skeletonLine: {
    height: 20,
    borderRadius: 10,
    backgroundColor: "#1a1a1a",
  },
  skeletonLineLong: {
    width: "90%",
  },
  skeletonLineMedium: {
    width: "80%",
  },
  skeletonLineShort: {
    width: "60%",
  },
  authorSkeleton: {
    width: 120,
    height: 16,
    borderRadius: 8,
    marginTop: 20,
    backgroundColor: "#1a1a1a",
  },
  badgeSkeleton: {
    position: "absolute",
    top: 80,
    right: 30,
    width: 80,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1a1a1a",
  },
  buttonsSkeleton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    gap: 12,
  },
  buttonSkeleton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1a1a1a",
  },
});
