import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Types
export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
}

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Async thunks
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Login failed");
      }

      // Store token in cookie
      Cookies.set("auth_token", data.access_token, { expires: 1 });

      // Store user data in localStorage
      if (data.user) {
        localStorage.setItem("admin_user", JSON.stringify(data.user));
      }

      return { user: data.user, token: data.access_token };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Network error";
      return rejectWithValue(message);
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  "auth/loadStored",
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get("auth_token");
      const userStr = localStorage.getItem("admin_user");

      if (token && userStr) {
        const user = JSON.parse(userStr);
        return { user, token };
      }

      return null;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error loading auth";
      return rejectWithValue(message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AdminUser; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    logout: (state) => {
      Cookies.remove("auth_token");
      localStorage.removeItem("admin_user");
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Load stored auth
      .addCase(loadStoredAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
        state.isLoading = false;
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setCredentials, logout, setLoading, clearError } = authSlice.actions;
export default authSlice.reducer;

