import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, setUser, logout, setLoading } =
  authSlice.actions;
export default authSlice.reducer;

// Thunks for async operations
export const loginThunk =
  (email: string, password: string) => async (dispatch: any) => {
    try {
      // Use the API_CONFIG to get the correct base URL
      const API_URL =
        process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save to AsyncStorage
      await AsyncStorage.setItem("@focus_auth_token", data.access_token);
      await AsyncStorage.setItem("@focus_user_data", JSON.stringify(data.user));

      dispatch(setCredentials({ user: data.user, token: data.access_token }));
    } catch (error) {
      throw error;
    }
  };

export const logoutThunk = () => async (dispatch: any) => {
  await AsyncStorage.removeItem("@focus_auth_token");
  await AsyncStorage.removeItem("@focus_user_data");
  dispatch(logout());
};

export const loadStoredAuth = () => async (dispatch: any) => {
  try {
    const token = await AsyncStorage.getItem("@focus_auth_token");
    const userStr = await AsyncStorage.getItem("@focus_user_data");

    if (token && userStr) {
      const user = JSON.parse(userStr);
      dispatch(setCredentials({ user, token }));
    } else {
      dispatch(setLoading(false));
    }
  } catch (error) {
    console.error("Error loading stored auth:", error);
    dispatch(setLoading(false));
  }
};
