import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface DotsIndicatorProps {
  readonly total: number;
  readonly currentIndex: number;
}

export default function DotsIndicator({
  total,
  currentIndex,
}: DotsIndicatorProps) {
  const { colors } = useTheme();

  // Limiter à 5 dots maximum pour éviter l'encombrement
  const maxDots = 5;
  const showDots = Math.min(total, maxDots);

  // Calculer quel dot doit être actif
  const getActiveDot = () => {
    if (total <= maxDots) return currentIndex;

    // Si on est au début
    if (currentIndex < 2) return currentIndex;

    // Si on est à la fin
    if (currentIndex >= total - 2) return maxDots - (total - currentIndex);

    // Au milieu
    return 2;
  };

  const activeDot = getActiveDot();

  return (
    <View style={styles.container}>
      {Array.from({ length: showDots }).map((_, index) => {
        const isActive = index === activeDot;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: isActive ? colors.accent : colors.border,
                width: isActive ? 24 : 6,
                opacity: isActive ? 1 : 0.5,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 6,
  } as ViewStyle,
  dot: {
    height: 6,
    borderRadius: 3,
  } as ViewStyle,
});
