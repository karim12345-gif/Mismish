import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Region } from "react-native-maps";
import { Store } from "../../services/store/store.service";

export interface ClusterItem {
  isCluster: boolean;
  count: number;
  latitude: number;
  longitude: number;
  store: Store;
}

export type ActiveFilter = "available" | "favorites" | "";

export interface StoreBottomCardProps {
  store: Store;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (storeId: number) => void;
}

export type FilterChip = {
  value: Exclude<ActiveFilter, "">;
  labelKey: string;
  icon: React.ComponentProps<typeof Ionicons>["name"] | null;
};

export const RIYADH: Region = {
  latitude: 24.7136,
  longitude: 46.6753,
  latitudeDelta: 0.25,
  longitudeDelta: 0.25,
};

export const FILTER_CHIPS: FilterChip[] = [
  { value: "available", labelKey: "map.available_now", icon: null },
  { value: "favorites", labelKey: "map.my_favorites", icon: "heart-outline" },
];
