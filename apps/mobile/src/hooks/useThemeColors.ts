import { useMemo } from "react";
import { useAppSelector } from "../store/hooks";
import { lightColors, darkColors, ThemeColors } from "../constants/colors";

interface UseThemeColorsReturn {
  colors: ThemeColors;
  isDark: boolean;
}

/**
 * Custom hook to get theme colors from Redux store
 * Replaces the old ThemeContext
 */
export const useThemeColors = (): UseThemeColorsReturn => {
  const isDark = useAppSelector((state) => state.theme.isDark);

  const colors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  return { colors, isDark };
};

