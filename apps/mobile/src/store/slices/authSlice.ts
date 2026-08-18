import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../../types";
import { API_CONFIG } from "../../constants/config";
import { clearAuthTokenCache } from "../../services/authTokenCache";

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

// Thunks for async operations (defined before slice to avoid hoisting issues)
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await fetch(`${API_CONFIG.getBaseUrl()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Login failed");
      }

      // Save to AsyncStorage
      await AsyncStorage.setItem("@focus_auth_token", data.access_token);
      clearAuthTokenCache();
      await AsyncStorage.setItem("@focus_user_data", JSON.stringify(data.user));

      return { user: data.user, token: data.access_token };
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  },
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (
    {
      name,
      email,
      password,
    }: { name: string; email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      // First, register the user
      const registerResponse = await fetch(
        `${API_CONFIG.getBaseUrl()}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        },
      );

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        return rejectWithValue(registerData.message || "Registration failed");
      }

      // Then, auto-login
      const loginResponse = await fetch(
        `${API_CONFIG.getBaseUrl()}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        return rejectWithValue(loginData.message || "Auto-login failed");
      }

      // Save to AsyncStorage
      await AsyncStorage.setItem("@focus_auth_token", loginData.access_token);
      clearAuthTokenCache();
      await AsyncStorage.setItem(
        "@focus_user_data",
        JSON.stringify(loginData.user),
      );

      return { user: loginData.user, token: loginData.access_token };
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  },
);

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
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(loginThunk.rejected, (state) => {
        state.isLoading = false;
      })
      // Register thunk
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(registerThunk.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setCredentials, setUser, logout, setLoading } =
  authSlice.actions;
export default authSlice.reducer;

// Other thunks
export const logoutThunk = () => async (dispatch: any) => {
  await AsyncStorage.removeItem("@focus_auth_token");
  clearAuthTokenCache();
  await AsyncStorage.removeItem("@focus_user_data");
  dispatch(logout());
};

export const loadStoredAuth = () => async (dispatch: any) => {
  try {
    console.log("[Auth] Loading stored auth from AsyncStorage...");
    const token = await AsyncStorage.getItem("@focus_auth_token");
    const userStr = await AsyncStorage.getItem("@focus_user_data");

    console.log("[Auth] Token exists:", !!token);
    console.log("[Auth] User data exists:", !!userStr);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log("[Auth] Successfully parsed user data for:", user.email);
        dispatch(setCredentials({ user, token }));
      } catch (parseError) {
        console.error("[Auth] Failed to parse user data, clearing storage:", parseError);
        // Clear corrupted data
        await AsyncStorage.removeItem("@focus_auth_token");
        clearAuthTokenCache();
        await AsyncStorage.removeItem("@focus_user_data");
        dispatch(setLoading(false));
      }
    } else {
      console.log("[Auth] No stored credentials found");
      dispatch(setLoading(false));
    }
  } catch (error) {
    console.error("[Auth] Error loading stored auth:", error);
    dispatch(setLoading(false));
  }
};
