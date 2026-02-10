import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContextProps } from "./types";

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      // Check token AND wait for minimum splash time (e.g. 2000ms)
      const [token] = await Promise.all([
        AsyncStorage.getItem("userToken"),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);

      if (token) {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.log("Failed to load token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token?: string) => {
    try {
      const tokenToSave = token || "dummy-token";
      await AsyncStorage.setItem("userToken", tokenToSave);
      setIsAuthenticated(true);
    } catch (e) {
      console.log("Failed to save token");
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      setIsAuthenticated(false);
    } catch (e) {
      console.log("Failed to remove token");
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
