import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
}

const getSystemTheme = (): boolean => {
  return Appearance.getColorScheme() === 'dark';
};

const initialState: ThemeState = {
  mode: 'system',
  isDark: getSystemTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      if (action.payload === 'system') {
        state.isDark = getSystemTheme();
      } else {
        state.isDark = action.payload === 'dark';
      }
    },
    setIsDark: (state, action: PayloadAction<boolean>) => {
      state.isDark = action.payload;
    },
  },
});

export const { setThemeMode, setIsDark } = themeSlice.actions;
export default themeSlice.reducer;

// Thunks
export const loadStoredTheme = () => async (dispatch: any) => {
  try {
    const storedTheme = await AsyncStorage.getItem('@focus_theme');
    if (storedTheme) {
      dispatch(setThemeMode(storedTheme as ThemeMode));
    }
  } catch (error) {
    console.error('Error loading stored theme:', error);
  }
};

export const changeTheme = (mode: ThemeMode) => async (dispatch: any) => {
  try {
    await AsyncStorage.setItem('@focus_theme', mode);
    dispatch(setThemeMode(mode));
  } catch (error) {
    console.error('Error saving theme:', error);
  }
};

