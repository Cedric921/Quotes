import { View, StyleSheet, Animated, useWindowDimensions } from "react-native";
import { useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";

export default function LoadingSkeleton() {
  const { height } = useWindowDimensions();
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation de pulsation (opacité)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Animation de shimmer (brillance qui traverse)
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ).start();
  }, [pulseAnim, shimmerAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.9],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  const SkeletonLine = ({ style }: { style?: any }) => (
    <Animated.View style={[styles.skeletonLine, style, { opacity }]}>
      {/* Effet shimmer avec gradient */}
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX: shimmerTranslate }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(255,255,255,0)",
            "rgba(255,255,255,0.3)",
            "rgba(255,255,255,0)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { height: height - 120 }]}>
      {/* Overlay semi-transparent pour indiquer le chargement */}
      <View style={styles.loadingOverlay}>
        {/* Skeleton de la citation - centré */}
        <View style={styles.skeletonContent}>
          <SkeletonLine style={styles.skeletonLineLong} />
          <SkeletonLine style={styles.skeletonLineMedium} />
          <SkeletonLine style={styles.skeletonLineShort} />
          <SkeletonLine style={styles.skeletonLineMedium} />

          {/* Author skeleton */}
          <Animated.View style={[styles.authorSkeleton, { opacity }]}>
            <Animated.View
              style={[
                styles.shimmer,
                {
                  transform: [{ translateX: shimmerTranslate }],
                },
              ]}
            >
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0)",
                  "rgba(255,255,255,0.2)",
                  "rgba(255,255,255,0)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>
          </Animated.View>
        </View>

        {/* Topic badge skeleton */}
        <Animated.View style={[styles.topicSkeleton, { opacity }]}>
          <Animated.View
            style={[
              styles.shimmer,
              {
                transform: [{ translateX: shimmerTranslate }],
              },
            ]}
          >
            <LinearGradient
              colors={[
                "rgba(255,255,255,0)",
                "rgba(255,255,255,0.15)",
                "rgba(255,255,255,0)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
        </Animated.View>
      </View>
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
  loadingOverlay: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  skeletonContent: {
    width: "100%",
    alignItems: "center",
    gap: 20,
  },
  skeletonLine: {
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
    // Ajouter une ombre pour plus de profondeur
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  skeletonLineLong: {
    width: "95%",
  },
  skeletonLineMedium: {
    width: "80%",
  },
  skeletonLineShort: {
    width: "60%",
  },
  authorSkeleton: {
    width: 160,
    height: 22,
    borderRadius: 11,
    marginTop: 40,
    backgroundColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  topicSkeleton: {
    position: "absolute",
    bottom: 40,
    width: 120,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  shimmerGradient: {
    flex: 1,
    width: 300,
  },
});
