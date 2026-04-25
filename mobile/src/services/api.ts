import axios, { InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

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
      if (!refreshToken) return Promise.reject(error);

      const { data } = await axios.post(`${API_URL}/customer/auth/refresh`, {
        refreshToken,
      });

      const newAccessToken: string = data.data.accessToken;
      await AsyncStorage.setItem("accessToken", newAccessToken);
      original.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(original);
    } catch {
      // Refresh failed — clear session so the app routes back to login
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
      return Promise.reject(error);
    }
  },
);

export default api;
