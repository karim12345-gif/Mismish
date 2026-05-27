import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContextProps, AuthUser } from "./types";
import { AuthServices } from "../services/auth/auth.service";
import { setSessionExpiredHandler } from "../services/api";

const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
  HAS_SELECTED_LOCATION: "hasSelectedLocation",
  HAS_SEEN_INTRO: "hasSeenIntro",
} as const;

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  isLoading: true,
  hasSelectedLocation: false,
  hasSeenIntro: false,
  user: null,
  login: async () => {},
  logout: async () => {},
  updateUser: () => {},
  setLocationSelected: async () => {},
  completeIntro: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSelectedLocation, setHasSelectedLocation] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    restoreSession();
    setSessionExpiredHandler(() => {
      setUser(null);
      setIsAuthenticated(false);
    });
  }, []);

  const restoreSession = async () => {
    try {
      const [accessToken, storedUser, locationSelected, introSeen] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.HAS_SELECTED_LOCATION),
          AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_INTRO),
          new Promise((resolve) => setTimeout(resolve, 2000)),
        ]);

      if (accessToken && storedUser) {
        setIsAuthenticated(true);
        setUser(JSON.parse(storedUser));
      }

      if (locationSelected) setHasSelectedLocation(true);
      if (introSeen) setHasSeenIntro(true);
    } catch (e) {
      console.error("Failed to restore session:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    accessToken: string,
    refreshToken: string,
    userData: AuthUser,
  ) => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
        [STORAGE_KEYS.USER, JSON.stringify(userData)],
      ]);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (e) {
      console.error("Failed to save session:", e);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        AuthServices.logout(refreshToken).catch(() => {});
      }
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.HAS_SEEN_INTRO,
      ]);
      setUser(null);
      setHasSeenIntro(false);
      setIsAuthenticated(false);
    } catch (e) {
      console.error("Failed to clear session:", e);
    }
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated)).catch(
        console.error,
      );
      return updated;
    });
  };

  const setLocationSelected = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_SELECTED_LOCATION, "true");
      setHasSelectedLocation(true);
    } catch (e) {
      console.error("Failed to save location selection:", e);
    }
  };

  const completeIntro = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_INTRO, "true");
      setHasSeenIntro(true);
    } catch (e) {
      console.error("Failed to save intro status:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        hasSelectedLocation,
        hasSeenIntro,
        user,
        login,
        logout,
        updateUser,
        setLocationSelected,
        completeIntro,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
