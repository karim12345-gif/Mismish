import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const LOCAL_KEY = "@mismish_favorites";

interface FavoritesContextType {
  favoriteIds: Set<number>;
  isFavorite: (storeId: number) => boolean;
  toggleFavorite: (storeId: number) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  // Load favorites — from API if logged in, from AsyncStorage if guest
  useEffect(() => {
    if (isAuthenticated) {
      api
        .get<{ status: string; data: { vendorIds: number[] } }>("/favorites/v1")
        .then((res) => setFavoriteIds(new Set(res.data.data.vendorIds)))
        .catch(() => {
          AsyncStorage.getItem(LOCAL_KEY).then((raw) => {
            if (raw) setFavoriteIds(new Set(JSON.parse(raw) as number[]));
          });
        });
    } else {
      AsyncStorage.getItem(LOCAL_KEY).then((raw) => {
        if (raw) setFavoriteIds(new Set(JSON.parse(raw) as number[]));
      });
    }
  }, [isAuthenticated]);

  // On first login sync any guest favorites up to the backend
  useEffect(() => {
    if (!isAuthenticated) return;
    AsyncStorage.getItem(LOCAL_KEY).then(async (raw) => {
      if (!raw) return;
      const localIds: number[] = JSON.parse(raw);
      if (localIds.length === 0) return;
      try {
        await api.post("/favorites/v1/sync", { vendorIds: localIds });
        await AsyncStorage.removeItem(LOCAL_KEY);
        setFavoriteIds((prev) => new Set([...prev, ...localIds]));
      } catch {}
    });
  }, [isAuthenticated]);

  const toggleFavorite = useCallback(
    (storeId: number) => {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.has(storeId) ? next.delete(storeId) : next.add(storeId);

        if (isAuthenticated) {
          // Optimistic — revert on failure
          api.post(`/favorites/v1/${storeId}`).catch(() => setFavoriteIds(prev));
        } else {
          AsyncStorage.setItem(LOCAL_KEY, JSON.stringify([...next]));
        }

        return next;
      });
    },
    [isAuthenticated],
  );

  const isFavorite = useCallback(
    (storeId: number) => favoriteIds.has(storeId),
    [favoriteIds],
  );

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext(): FavoritesContextType {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavoritesContext must be used within FavoritesProvider");
  return ctx;
}
