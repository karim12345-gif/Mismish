import axios from "axios";

// Access environment variable
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Add interceptor to log requests (helpful for debugging)
api.interceptors.request.use((request) => {
  console.log("Starting Request", JSON.stringify(request.url, null, 2));
  return request;
});

export default api;
