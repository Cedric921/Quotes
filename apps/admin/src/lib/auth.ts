import Cookies from 'js-cookie';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials);
  const { access_token } = response.data;
  
  // Store token in cookie
  Cookies.set('auth_token', access_token, { expires: 1 }); // 1 day
  
  return response.data;
};

export const logout = () => {
  Cookies.remove('auth_token');
};

export const getToken = (): string | undefined => {
  return Cookies.get('auth_token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Axios instance with auth header
export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
