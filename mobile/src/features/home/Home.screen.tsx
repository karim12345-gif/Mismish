import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "../../context/LocationContext";
import { View, ScrollView, Text, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CartReservationBanner from "../cart/CartReservationBanner";
import { HomeHeader } from "./components/HomeHeader";
import { HomeSearchBar } from "./components/HomeSearchBar";
import { HomeHeroBanner } from "./components/HomeHeroBanner";
import { HomeFeaturedCollections } from "./components/HomeFeaturedCollections";
import { HomeFilters } from "./components/HomeFilters";
import { SurpriseBagCard } from "./components/SurpriseBagCard";
import { StoreCard } from "./components/StoreCard";
import { StoreListSkeleton } from "./components/StoreCardSkeleton";
import { SurpriseBagRowSkeleton } from "./components/SurpriseBagCardSkeleton";
import { useStores } from "../../hooks/useStores";
import { Store, SurpriseBox } from "../../services/store/store.service";
import { SortOption } from "./components/SortBottomSheet";
import { PriceRange } from "./components/PriceBottomSheet";
import { AllergyOnboardingSheet, ALLERGY_ONBOARDED_KEY } from "../../components/AllergyOnboarding/AllergyOnboardingSheet";

const formatPickupTime = (start: string, end: string): string => {
  const fmt = (d: string) =>
    new Date(d).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  return `${fmt(start)} - ${fmt(end)}`;
};

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistance = (
  userLat: number, userLng: number,
  storeLat: number | null, storeLng: number | null,
): string => {
  if (storeLat == null || storeLng == null) return "—";
  const km = haversineKm(userLat, userLng, storeLat, storeLng);
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800";

export default function HomeScreen() {
  const { location } = useLocation();
  const { data: stores, isLoading, isError } = useStores();

  const [sortBy, setSortBy] = useState<SortOption>("");
  const [activeCuisine, setActiveCuisine] = useState("");
  const [activePriceRange, setActivePriceRange] = useState<PriceRange>("");
  const [showAllergySheet, setShowAllergySheet] = useState(false);

  // Show allergy sheet once after stores load — before they ever order
  useEffect(() => {
    if (isLoading || !stores) return;
    AsyncStorage.getItem(ALLERGY_ONBOARDED_KEY).then((val) => {
      if (!val) {
        const timer = setTimeout(() => setShowAllergySheet(true), 1500);
        return () => clearTimeout(timer);
      }
    });
  }, [isLoading, stores]);

  const filteredStores = useMemo(() => {
    let result = [...(stores ?? [])];

    if (activeCuisine) {
      result = result.filter(s => s.category === activeCuisine);
    }

    if (activePriceRange) {
      result = result.filter(s => {
        const price = s.listings[0]?.price ?? 0;
        if (activePriceRange === "1-15") return price <= 15;
        if (activePriceRange === "16-25") return price >= 16 && price <= 25;
        if (activePriceRange === "25+") return price > 25;
        return true;
      });
    }

    if (sortBy === "pickup_time") {
      result.sort((a, b) => {
        const aEnd = a.listings[0]?.pickupEnd
          ? new Date(a.listings[0].pickupEnd).getTime()
          : Infinity;
        const bEnd = b.listings[0]?.pickupEnd
          ? new Date(b.listings[0].pickupEnd).getTime()
          : Infinity;
        return aEnd - bEnd;
      });
    } else if (location) {
      // Default: always sort by distance when we have a location
      const { latitude, longitude } = location.coords;
      result.sort((a, b) => {
        const distA =
          a.latitude != null && a.longitude != null
            ? haversineKm(latitude, longitude, a.latitude, a.longitude)
            : Infinity;
        const distB =
          b.latitude != null && b.longitude != null
            ? haversineKm(latitude, longitude, b.latitude, b.longitude)
            : Infinity;
        return distA - distB;
      });
    }

    // Always push stores with no active bags to the bottom
    result.sort((a, b) => {
      const aHas = a.listings.length > 0 ? 0 : 1;
      const bHas = b.listings.length > 0 ? 0 : 1;
      return aHas - bHas;
    });

    return result;
  }, [stores, activeCuisine, activePriceRange, sortBy, location]);

  // Bags section: closest stores with an active listing
  const activeBags: { store: Store; bag: SurpriseBox }[] = (stores ?? [])
    .filter((s) => s.listings.length > 0)
    .sort((a, b) => {
      if (!location) return 0;
      const { latitude, longitude } = location.coords;
      const distA = a.latitude != null && a.longitude != null
        ? haversineKm(latitude, longitude, a.latitude, a.longitude) : Infinity;
      const distB = b.latitude != null && b.longitude != null
        ? haversineKm(latitude, longitude, b.latitude, b.longitude) : Infinity;
      return distA - distB;
    })
    .map((s) => ({ store: s, bag: s.listings[0] }))
    .slice(0, 5);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <HomeHeader />

      <ScrollView showsVerticalScrollIndicator={false} className="bg-[#F9F9F9]">
        <HomeSearchBar />
        <HomeHeroBanner />
        <HomeFeaturedCollections />

        {/* Awesome Bags Section */}
        <View className="mt-4">
          <Text className="px-5 text-[#111] text-[16px] font-black tracking-tight mb-4">
            Awesome bags in your area 🔥
          </Text>

          {isLoading ? (
            <SurpriseBagRowSkeleton />
          ) : isError ? (
            <Text className="px-5 text-gray-400 text-[13px]">
              Could not load bags right now.
            </Text>
          ) : activeBags.length === 0 ? (
            <Text className="px-5 text-gray-400 text-[13px]">
              No bags available right now.
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }}
            >
              {activeBags.map(({ store, bag }) => (
                <View key={`${store.id}-${bag.id}`} className="mr-4">
                  <SurpriseBagCard
                    storeId={store.id}
                    title={bag.name}
                    price={`${bag.price} SAR`}
                    originalPrice={
                      bag.originalPrice ? `${bag.originalPrice} SAR` : ""
                    }
                    timeRange={formatPickupTime(bag.pickupStart, bag.pickupEnd)}
                    distance={
                      location
                        ? formatDistance(location.coords.latitude, location.coords.longitude, store.latitude, store.longitude)
                        : "—"
                    }
                    imageUrl={bag.imageUrl ?? store.imageUrl ?? FALLBACK_IMAGE}
                    logoUrl={store.imageUrl ?? bag.imageUrl ?? FALLBACK_IMAGE}
                    leftCount={`${bag.quantity} left`}
                    allergens={bag.allergens}
                    ingredients={bag.ingredients}
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* All Stores */}
        <View className="mt-4 pt-6 border-t border-[#f3f3f3]">
          <Text className="px-5 text-[#111] text-[16px] font-black tracking-tight mb-4">
            All Stores
          </Text>
          <HomeFilters
            stores={stores ?? []}
            sortBy={sortBy}
            activeCuisine={activeCuisine}
            activePriceRange={activePriceRange}
            onSortChange={setSortBy}
            onCuisineChange={setActiveCuisine}
            onPriceChange={setActivePriceRange}
          />
        </View>

        {/* Available Now */}
        <View className="px-5 mt-6 pb-32">
          <Text className="text-[#111] text-[18px] font-black tracking-tight mb-5">
            Available Now ⚡
          </Text>

          {isLoading ? (
            <StoreListSkeleton count={3} />
          ) : isError ? (
            <Text className="text-gray-400 text-[13px]">
              Could not load stores right now.
            </Text>
          ) : filteredStores.length === 0 ? (
            <Text className="text-gray-400 text-[13px]">
              No stores match your filters.
            </Text>
          ) : (
            <View>
              {filteredStores.map((store) => {
                const firstBag = store.listings[0];
                const totalLeft = store.listings.reduce(
                  (sum, l) => sum + l.quantity,
                  0,
                );
                return (
                  <StoreCard
                    key={store.id}
                    storeId={store.id}
                    title={store.name}
                    branch={
                      store.category ?? store.address?.split(",")[0] ?? ""
                    }
                    price={firstBag ? `${firstBag.price} SAR` : "—"}
                    timeRange={
                      firstBag
                        ? formatPickupTime(
                            firstBag.pickupStart,
                            firstBag.pickupEnd,
                          )
                        : "—"
                    }
                    distance={
                      location
                        ? formatDistance(location.coords.latitude, location.coords.longitude, store.latitude, store.longitude)
                        : "—"
                    }
                    imageUrl={store.imageUrl ?? FALLBACK_IMAGE}
                    logoUrl={store.imageUrl ?? FALLBACK_IMAGE}
                    leftCount={`${totalLeft} bag${totalLeft !== 1 ? "s" : ""} left`}
                    hasListings={totalLeft > 0}
                    rating={store.rating}
                    reviewCount={store.reviewCount}
                    allergens={firstBag?.allergens}
                    ingredients={firstBag?.ingredients}
                  />
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <AllergyOnboardingSheet
        visible={showAllergySheet}
        onDone={() => setShowAllergySheet(false)}
      />
      <CartReservationBanner />
    </SafeAreaView>
  );
}
