import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useStores } from "../../hooks/useStores";
import { Store } from "../../services/store/store.service";
import {
  StoreBottomCard,
  buildClusters,
  clusterBubbleSize,
  FLY_DELTA,
  styles,
  CORAL,
  FALLBACK_IMAGE,
  RIYADH,
  FILTER_CHIPS,
} from "./";

// ─── MapScreen ────────────────────────────────────────────────────────────────

export default function MapScreen() {
  const { data: stores = [] } = useStores();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [activeFilter, setActiveFilter] = useState("Available Now");
  const [latDelta, setLatDelta] = useState(RIYADH.latitudeDelta);
  const mapRef = useRef<MapView>(null);

  const flyToCurrentLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    const { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      mayShowUserSettingsDialog: true,
    });
    mapRef.current?.animateToRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: FLY_DELTA,
      longitudeDelta: FLY_DELTA,
    });
  }, []);

  useEffect(() => {
    flyToCurrentLocation();
  }, [flyToCurrentLocation]);

  const filteredStores =
    activeFilter === "Available Now"
      ? stores.filter((s) => s.listings.length > 0)
      : stores;

  const clusters = buildClusters(filteredStores, latDelta);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={RIYADH}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={() => setSelectedStore(null)}
        onRegionChangeComplete={(r) => setLatDelta(r.latitudeDelta)}
      >
        {clusters.map((item: any, idx: number) => {
          const bubbleSize = item.isCluster ? clusterBubbleSize(item.count) : 50;
          return (
            <Marker
              key={`${item.isCluster ? "cluster" : "store"}-${idx}`}
              coordinate={{ latitude: item.latitude, longitude: item.longitude }}
              tracksViewChanges={false}
              onPress={(e) => {
                e.stopPropagation();
                if (!item.isCluster) setSelectedStore(item.store);
              }}
            >
              {item.isCluster ? (
                <View
                  style={[
                    styles.clusterBubble,
                    { width: bubbleSize, height: bubbleSize, borderRadius: bubbleSize / 2 },
                  ]}
                >
                  <Text style={[styles.clusterCount, { fontSize: item.count < 10 ? 15 : 16 }]}>
                    {item.count}
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.storePin,
                    { borderColor: selectedStore?.id === item.store.id ? CORAL : "#fff" },
                  ]}
                >
                  <Image
                    source={{ uri: item.store.imageUrl ?? FALLBACK_IMAGE }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>
              )}
            </Marker>
          );
        })}
      </MapView>

      <View style={[styles.topOverlay, { top: Platform.OS === "ios" ? 60 : 40 }]}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={CORAL} style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Search for restaurants or meals"
            placeholderTextColor="#BBB"
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <View style={styles.filterSort}>
            <Ionicons name="options-outline" size={16} color="#111" />
            <Feather name="chevron-down" size={13} color="#111" style={{ marginLeft: 3 }} />
          </View>

          {FILTER_CHIPS.map((chip: any) => {
            const active = activeFilter === chip.label;
            return (
              <TouchableOpacity
                key={chip.label}
                onPress={() => setActiveFilter(active ? "" : chip.label)}
                activeOpacity={0.8}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                {chip.icon && (
                  <Ionicons
                    name={chip.icon}
                    size={13}
                    color={active ? "#fff" : "#111"}
                    style={{ marginRight: 5 }}
                  />
                )}
                <Text style={[styles.filterChipLabel, active && styles.filterChipLabelActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <TouchableOpacity
        onPress={flyToCurrentLocation}
        activeOpacity={0.85}
        style={[styles.locationFab, { bottom: selectedStore ? 260 : 110 }]}
      >
        <Ionicons name="locate" size={22} color={CORAL} />
      </TouchableOpacity>

      {selectedStore && (
        <StoreBottomCard
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
        />
      )}
    </View>
  );
}
