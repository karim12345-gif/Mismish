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

export interface StoreBottomCardProps {
  store: Store;
  onClose: () => void;
}

export type FilterChip = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"] | null;
};

export const RIYADH: Region = {
  latitude: 24.7136,
  longitude: 46.6753,
  latitudeDelta: 0.25,
  longitudeDelta: 0.25,
};

export const FILTER_CHIPS: FilterChip[] = [
  { label: "Available Now", icon: null },
  { label: "My Favorites", icon: "heart-outline" },
  { label: "Cuisine", icon: "restaurant-outline" },
];
