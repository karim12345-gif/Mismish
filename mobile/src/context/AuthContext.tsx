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
  hasSelectedLocation: false,
  hasSeenIntro: false,
  login: () => {},
  logout: () => {},
  setLocationSelected: () => {},
  completeIntro: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSelectedLocation, setHasSelectedLocation] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const [token, locationSelected, introSeen] = await Promise.all([
        AsyncStorage.getItem("userToken"),
        AsyncStorage.getItem("hasSelectedLocation"),
        AsyncStorage.getItem("hasSeenIntro"),
      ]);

      console.log("Checking login status:", {
        token,
        locationSelected,
        introSeen,
      });

      if (token) {
        setIsAuthenticated(true);
      }

      if (locationSelected) {
        setHasSelectedLocation(true);
      }

      if (introSeen) {
        setHasSeenIntro(true);
      }
    } catch (e) {
      console.log("Failed to load token", e);
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
      // Don't remove location preference or intro preference
      setIsAuthenticated(false);
      // setHasSelectedLocation(false);
    } catch (e) {
      console.log("Failed to remove token");
    }
  };

  const setLocationSelected = async () => {
    try {
      await AsyncStorage.setItem("hasSelectedLocation", "true");
      setHasSelectedLocation(true);
    } catch (e) {
      console.log("Failed to save location selection");
    }
  };

  const completeIntro = async () => {
    try {
      await AsyncStorage.setItem("hasSeenIntro", "true");
      setHasSeenIntro(true);
    } catch (e) {
      console.log("Failed to save intro status");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        hasSelectedLocation,
        hasSeenIntro,
        login,
        logout,
        setLocationSelected,
        completeIntro,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
