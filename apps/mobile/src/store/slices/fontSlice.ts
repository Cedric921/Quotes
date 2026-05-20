import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fontsApi } from "../../services/api";

export interface SelectedFont {
  id: string;
  name: string;
  fontFamily: string;
}

interface FontState {
  selectedFont: SelectedFont | null;
}

const initialState: FontState = {
  selectedFont: null,
};

const fontSlice = createSlice({
  name: "font",
  initialState,
  reducers: {
    setSelectedFont: (state, action: PayloadAction<SelectedFont | null>) => {
      state.selectedFont = action.payload;
    },
  },
});

export const { setSelectedFont } = fontSlice.actions;
export default fontSlice.reducer;

// Thunks
export const loadStoredFont = () => async (dispatch: any) => {
  try {
    const storedFont = await AsyncStorage.getItem("@focus_selected_font");
    if (storedFont) {
      dispatch(setSelectedFont(JSON.parse(storedFont)));
      return;
    }
    // No user selection: fall back to the admin-defined default font
    try {
      const defaultFont = await fontsApi.getDefaultFont();
      if (defaultFont) {
        dispatch(
          setSelectedFont({
            id: defaultFont.id,
            name: defaultFont.name,
            fontFamily: defaultFont.fontFamily,
          }),
        );
      }
    } catch (err) {
      console.error("Error loading default font:", err);
    }
  } catch (error) {
    console.error("Error loading stored font:", error);
  }
};

export const changeSelectedFont =
  (font: SelectedFont | null) => async (dispatch: any) => {
    try {
      if (font) {
        await AsyncStorage.setItem(
          "@focus_selected_font",
          JSON.stringify(font),
        );
      } else {
        await AsyncStorage.removeItem("@focus_selected_font");
      }
      dispatch(setSelectedFont(font));
    } catch (error) {
      console.error("Error saving selected font:", error);
    }
  };
