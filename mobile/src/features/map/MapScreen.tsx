import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import { MainTabParamList } from "../../navigation/types";
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
  useFavorites,
} from "./";
import type { ActiveFilter } from "./";
import { FavoritesListSheet } from "./FavoritesListSheet";
import {
  MapFilterSheet,
  MapFilters,
  DEFAULT_MAP_FILTERS,
} from "./MapFilterSheet";

export default function MapScreen() {
  const { data: stores = [] } = useStores();
  const { isFavorite, toggleFavorite, favoriteIds } = useFavorites();

  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<MainTabParamList, "Map">>();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [activeFilter, setActiveFilter] =
    useState<ActiveFilter>("Available Now");
  const [latDelta, setLatDelta] = useState(RIYADH.latitudeDelta);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [mapFilters, setMapFilters] = useState<MapFilters>(DEFAULT_MAP_FILTERS);
  const mapRef = useRef<MapView>(null);

  const cuisines = useMemo(
    () =>
      [
        ...new Set(stores.map((s) => s.category).filter(Boolean) as string[]),
      ].sort(),
    [stores],
  );

  const handleSelectFavorite = useCallback((store: Store) => {
    setSelectedStore(store);
    if (store.latitude != null && store.longitude != null) {
      mapRef.current?.animateToRegion({
        latitude: store.latitude,
        longitude: store.longitude,
        latitudeDelta: FLY_DELTA,
        longitudeDelta: FLY_DELTA,
      });
    }
  }, []);

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

  useEffect(() => {
    if (route.params?.flyToLocation) {
      flyToCurrentLocation();
      navigation.setParams({ flyToLocation: false });
    }
  }, [route.params?.flyToLocation]);

  const handleFilterPress = (label: ActiveFilter) => {
    if (activeFilter === label) {
      setActiveFilter("");
    } else {
      setActiveFilter(label);
    }
  };

  const filteredStores = useMemo(() => {
    const now = new Date();
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);
    const startOfTomorrow = new Date(now);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);
    const endOfTomorrow = new Date(startOfTomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    return stores.filter((s) => {
      // chip filters
      if (activeFilter === "Available Now" && s.listings.length === 0)
        return false;
      if (activeFilter === "My Favorites" && !isFavorite(s.id)) return false;

      // sheet: cuisine
      if (mapFilters.cuisine && s.category !== mapFilters.cuisine) return false;

      // sheet: favorites toggle
      if (mapFilters.favoritesOnly && !isFavorite(s.id)) return false;

      // sheet: availability
      if (mapFilters.availability.length > 0) {
        const matches = s.listings.some((l) => {
          const start = new Date(l.pickupStart);
          const end = new Date(l.pickupEnd);
          return mapFilters.availability.some((a) => {
            if (a === "now") return start <= now && end > now;
            if (a === "later_today") return start > now && start <= endOfToday;
            if (a === "tomorrow")
              return start >= startOfTomorrow && start <= endOfTomorrow;
            return false;
          });
        });
        if (!matches) return false;
      }

      // sheet: price
      if (mapFilters.priceRange) {
        const price = Math.min(...s.listings.map((l) => l.price));
        if (mapFilters.priceRange === "1-15" && price > 15) return false;
        if (mapFilters.priceRange === "16-25" && (price < 16 || price > 25))
          return false;
        if (mapFilters.priceRange === "25+" && price <= 25) return false;
      }

      return true;
    });
  }, [stores, activeFilter, isFavorite, mapFilters]);

  const clusters = buildClusters(filteredStores, latDelta);

  return (
    <View style={styles.mapContainer}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <MapView
        ref={mapRef}
        style={styles.mapContainer}
        initialRegion={RIYADH}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={() => setSelectedStore(null)}
        onRegionChangeComplete={(r) => setLatDelta(r.latitudeDelta)}
      >
        {clusters.map((item, idx) => {
          const bubbleSize = item.isCluster
            ? clusterBubbleSize(item.count)
            : 50;
          return (
            <Marker
              key={`${item.isCluster ? "cluster" : "store"}-${idx}`}
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
              }}
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
                    {
                      width: bubbleSize,
                      height: bubbleSize,
                      borderRadius: bubbleSize / 2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.clusterCount,
                      { fontSize: item.count < 10 ? 15 : 16 },
                    ]}
                  >
                    {item.count}
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.storePin,
                    {
                      borderColor:
                        selectedStore?.id === item.store.id ? CORAL : "#fff",
                    },
                  ]}
                >
                  <Image
                    source={{ uri: item.store.imageUrl ?? FALLBACK_IMAGE }}
                    style={styles.markerImage}
                    resizeMode="cover"
                  />
                </View>
              )}
            </Marker>
          );
        })}
      </MapView>

      {/* Top overlay */}
      <View style={styles.topOverlay}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate("Search")}
          style={styles.searchBar}
        >
          <Feather
            name="search"
            size={18}
            color={CORAL}
            style={styles.searchIcon}
          />
          <Text style={styles.searchInput}>
            Search restaurants, meals, or cuisine
          </Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            onPress={() => setFilterSheetOpen(true)}
            activeOpacity={0.8}
            style={styles.filterSort}
          >
            <Ionicons name="options-outline" size={16} color="#111" />
            <Feather
              name="chevron-down"
              size={13}
              color="#111"
              style={styles.filterSortChevron}
            />
          </TouchableOpacity>

          {FILTER_CHIPS.map((chip) => {
            const active = activeFilter === chip.label;
            const label = chip.label;
            return (
              <TouchableOpacity
                key={chip.label}
                onPress={() => handleFilterPress(chip.label as ActiveFilter)}
                activeOpacity={0.8}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                {chip.icon && (
                  <Ionicons
                    name={chip.icon}
                    size={13}
                    color={active ? "#fff" : "#111"}
                    style={styles.filterChipIcon}
                  />
                )}
                <Text
                  style={[
                    styles.filterChipLabel,
                    active && styles.filterChipLabelActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Location FAB */}
      <TouchableOpacity
        onPress={flyToCurrentLocation}
        activeOpacity={0.85}
        style={[
          styles.locationFab,
          selectedStore
            ? styles.locationFabWithCard
            : styles.locationFabDefault,
        ]}
      >
        <Ionicons name="locate" size={22} color={CORAL} />
      </TouchableOpacity>

      {activeFilter === "My Favorites" && !selectedStore && (
        <FavoritesListSheet
          stores={stores}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
          onSelectStore={handleSelectFavorite}
        />
      )}

      {selectedStore && (
        <StoreBottomCard
          store={selectedStore}
          isFavorite={isFavorite(selectedStore.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelectedStore(null)}
        />
      )}

      <MapFilterSheet
        visible={filterSheetOpen}
        current={mapFilters}
        categories={cuisines}
        onClose={() => setFilterSheetOpen(false)}
        onApply={setMapFilters}
      />
    </View>
  );
}
