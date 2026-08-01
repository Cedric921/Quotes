import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from "react-native";
import { useTheme, type Theme } from "./ThemeProvider";

type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

/**
 * Builds a stylesheet from the theme, once per theme identity.
 *
 * v1 called `StyleSheet.create()` inside the render body of 14 files, which
 * rebuilt every sheet on every render. Theme objects here are memoised per
 * (surface, font), so a WeakMap keyed on the theme gives us a stable sheet
 * for the lifetime of that theme — the factory runs once, not once per render.
 *
 *   const useStyles = makeStyles((t) => ({
 *     row: { paddingHorizontal: t.gutter, backgroundColor: t.base.bg },
 *   }));
 *
 *   function Row() {
 *     const s = useStyles();
 *     return <View style={s.row} />;
 *   }
 */
export function makeStyles<T extends NamedStyles>(factory: (theme: Theme) => T) {
  const cache = new WeakMap<Theme, T>();

  return function useStyles(): T {
    const theme = useTheme();
    let sheet = cache.get(theme);
    if (!sheet) {
      sheet = StyleSheet.create(factory(theme)) as T;
      cache.set(theme, sheet);
    }
    return sheet;
  };
}

/**
 * Escape hatch for the handful of styles that genuinely depend on a runtime
 * value (screen height, an item index). Keep these tiny and outside the
 * cached sheet rather than rebuilding the whole sheet.
 */
export function useThemed<R>(selector: (theme: Theme) => R): R {
  return selector(useTheme());
}
