import axios, { InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL — no trailing slash, no module name.
// Each service file appends its own /api/{module}/v1 path.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

let _onSessionExpired: (() => void) | null = null;

export const setSessionExpiredHandler = (handler: () => void) => {
  _onSessionExpired = handler;
};

// Attach access token to every request
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await AsyncStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401: attempt a silent token refresh, then retry once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) {
        _onSessionExpired?.();
        return Promise.reject(error);
      }

      const { data } = await axios.post(`${BASE_URL}/auth/v1/refresh`, {
        refreshToken,
      });

      const newAccessToken: string = data.data.accessToken;
      await AsyncStorage.setItem("accessToken", newAccessToken);
      original.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(original);
    } catch {
      // Refresh failed — clear session and notify AuthContext
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
      _onSessionExpired?.();
      return Promise.reject(error);
    }
  },
);

export default api;
