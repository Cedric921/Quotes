import { View, StyleSheet, Animated, useWindowDimensions } from "react-native";
import { useEffect, useRef } from "react";

export default function LoadingSkeleton() {
  const { height } = useWindowDimensions();
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
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.container, { height: height - 120 }]}>
      {/* Skeleton de la citation - centré */}
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
        <Animated.View
          style={[styles.skeletonLine, styles.skeletonLineMedium, { opacity }]}
        />

        {/* Author skeleton */}
        <Animated.View style={[styles.authorSkeleton, { opacity }]} />
      </View>

      {/* Topic badge skeleton */}
      <Animated.View style={[styles.topicSkeleton, { opacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  skeletonContent: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  skeletonLine: {
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  skeletonLineLong: {
    width: "95%",
  },
  skeletonLineMedium: {
    width: "75%",
  },
  skeletonLineShort: {
    width: "55%",
  },
  authorSkeleton: {
    width: 140,
    height: 18,
    borderRadius: 9,
    marginTop: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  topicSkeleton: {
    position: "absolute",
    bottom: 40,
    width: 100,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
});
