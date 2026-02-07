import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";

const { height } = Dimensions.get("window");

export default function LoadingSkeleton() {
  const { colors } = useTheme();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Logo animé */}
      <Animated.View style={[styles.logoContainer, { opacity }]}>
        <View
          style={[
            styles.logoCircle,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          <View style={styles.logoText}>
            <View
              style={[styles.logoLine, { backgroundColor: colors.border }]}
            />
            <View
              style={[
                styles.logoLine,
                styles.logoLineShort,
                { backgroundColor: colors.border },
              ]}
            />
          </View>
        </View>
      </Animated.View>

      {/* Skeleton de la citation */}
      <View style={styles.skeletonContent}>
        <Animated.View
          style={[
            styles.skeletonLine,
            styles.skeletonLineLong,
            { backgroundColor: colors.cardBackground, opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonLine,
            styles.skeletonLineMedium,
            { backgroundColor: colors.cardBackground, opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonLine,
            styles.skeletonLineShort,
            { backgroundColor: colors.cardBackground, opacity },
          ]}
        />

        {/* Author skeleton */}
        <Animated.View
          style={[
            styles.authorSkeleton,
            { backgroundColor: colors.cardBackground, opacity },
          ]}
        />
      </View>

      {/* Badge skeleton */}
      <Animated.View
        style={[
          styles.badgeSkeleton,
          { backgroundColor: colors.cardBackground, opacity },
        ]}
      />

      {/* Buttons skeleton */}
      <View style={styles.buttonsSkeleton}>
        {[1, 2, 3].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.buttonSkeleton,
              { backgroundColor: colors.cardBackground, opacity },
            ]}
          />
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
  } as ViewStyle,
  logoContainer: {
    marginBottom: 60,
  } as ViewStyle,
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  logoText: {
    rowGap: 8,
  } as TextStyle,
  logoLine: {
    height: 4,
    width: 40,
    borderRadius: 2,
  } as ViewStyle,
  logoLineShort: {
    width: 28,
  } as ViewStyle,
  skeletonContent: {
    width: "100%",
    alignItems: "center",
    rowGap: 16,
  } as ViewStyle,
  skeletonLine: {
    height: 20,
    borderRadius: 10,
  } as ViewStyle,
  skeletonLineLong: {
    width: "90%",
  } as ViewStyle,
  skeletonLineMedium: {
    width: "80%",
  } as ViewStyle,
  skeletonLineShort: {
    width: "60%",
  } as ViewStyle,
  authorSkeleton: {
    width: 120,
    height: 16,
    borderRadius: 8,
    marginTop: 20,
  } as ViewStyle,
  badgeSkeleton: {
    position: "absolute",
    top: 80,
    right: 30,
    width: 80,
    height: 32,
    borderRadius: 16,
  } as ViewStyle,
  buttonsSkeleton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    rowGap: 12,
  } as ViewStyle,
  buttonSkeleton: {
    width: 56,
    height: 56,
    borderRadius: 28,
  } as ViewStyle,
});
