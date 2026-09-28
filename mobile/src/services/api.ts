import axios, { InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL includes /api. Each service appends its own /{module}/v1 path.
const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

if (!configuredBaseUrl) {
  throw new Error(
    "Missing EXPO_PUBLIC_API_URL. Set it in mobile/.env for local development " +
      "or in the selected EAS build profile.",
  );
}

if (!/^https?:\/\//i.test(configuredBaseUrl)) {
  throw new Error("EXPO_PUBLIC_API_URL must be an absolute HTTP(S) URL.");
}

const BASE_URL = configuredBaseUrl.replace(/\/+$/, "");

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
