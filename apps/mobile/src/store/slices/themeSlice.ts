import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";

type ThemeMode = "light" | "dark" | "system";

export interface BackgroundTheme {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl?: string;
}

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  backgroundTheme: BackgroundTheme | null;
}

const getSystemTheme = (): boolean => {
  return Appearance.getColorScheme() === "dark";
};

const initialState: ThemeState = {
  mode: "system",
  isDark: getSystemTheme(),
  backgroundTheme: null,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      if (action.payload === "system") {
        state.isDark = getSystemTheme();
      } else {
        state.isDark = action.payload === "dark";
      }
    },
    setIsDark: (state, action: PayloadAction<boolean>) => {
      state.isDark = action.payload;
    },
    setBackgroundTheme: (
      state,
      action: PayloadAction<BackgroundTheme | null>,
    ) => {
      state.backgroundTheme = action.payload;
    },
  },
});

export const { setThemeMode, setIsDark, setBackgroundTheme } =
  themeSlice.actions;
export default themeSlice.reducer;

// Thunks
export const loadStoredTheme = () => async (dispatch: any) => {
  try {
    const storedTheme = await AsyncStorage.getItem("@focus_theme");
    if (storedTheme) {
      dispatch(setThemeMode(storedTheme as ThemeMode));
    }

    // Load background theme
    const storedBgTheme = await AsyncStorage.getItem("@focus_background_theme");
    if (storedBgTheme) {
      dispatch(setBackgroundTheme(JSON.parse(storedBgTheme)));
    }
  } catch (error) {
    console.error("Error loading stored theme:", error);
  }
};

export const changeTheme = (mode: ThemeMode) => async (dispatch: any) => {
  try {
    await AsyncStorage.setItem("@focus_theme", mode);
    dispatch(setThemeMode(mode));
  } catch (error) {
    console.error("Error saving theme:", error);
  }
};

export const changeBackgroundTheme =
  (theme: BackgroundTheme | null) => async (dispatch: any) => {
    try {
      if (theme) {
        await AsyncStorage.setItem(
          "@focus_background_theme",
          JSON.stringify(theme),
        );
      } else {
        await AsyncStorage.removeItem("@focus_background_theme");
      }
      dispatch(setBackgroundTheme(theme));
    } catch (error) {
      console.error("Error saving background theme:", error);
    }
  };
