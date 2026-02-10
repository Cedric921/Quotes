import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_CONFIG } from "../constants/config";

interface User {
  id: number;
  name: string;
  email: string;
  isPremium: boolean;
  isAdmin: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "@focus_auth_token";
const USER_KEY = "@focus_user_data";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading auth data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        `${API_CONFIG.getBaseUrl()}/auth/login`,
        {
          email,
          password,
        },
      );

      const { access_token, user: userData } = response.data;

      // Use user data from API response if available, otherwise decode JWT
      let finalUserData: User;

      if (userData) {
        finalUserData = {
          ...userData,
          name: userData.name || email.split("@")[0],
          isPremium: userData.isPremium || userData.isSubscribed || false,
        };
      } else {
        // Fallback: Decode JWT to get user info (simple decode, not verification)
        const payload = JSON.parse(atob(access_token.split(".")[1]));
        finalUserData = {
          id: payload.sub,
          email: payload.email,
          name: payload.name || email.split("@")[0],
          isPremium: payload.isPremium || false,
          isAdmin: payload.isAdmin || false,
          createdAt: "",
          updatedAt: "",
        };
      }

      // Store token and user data
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, access_token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(finalUserData)),
      ]);

      setToken(access_token);
      setUser(finalUserData);
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await axios.post(`${API_CONFIG.getBaseUrl()}/auth/register`, {
        name,
        email,
        password,
      });

      // Auto-login after registration
      await login(email, password);
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);

      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }
  };

  const refreshUser = async () => {
    if (!user || !token) return;

    try {
      const response = await axios.get(
        `${API_CONFIG.getBaseUrl()}/users/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedUserData = {
        ...response.data,
        name: response.data.name || user.name,
        isPremium:
          response.data.isPremium || response.data.isSubscribed || false,
      };

      setUser(updatedUserData);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUserData));
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
