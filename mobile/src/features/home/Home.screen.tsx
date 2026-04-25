import React, { useEffect } from "react";
import { useLocation } from "../../context/LocationContext";
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeHeader } from "./components/HomeHeader";
import { HomeSearchBar } from "./components/HomeSearchBar";
import { HomeHeroBanner } from "./components/HomeHeroBanner";
import { HomeFeaturedCollections } from "./components/HomeFeaturedCollections";
import { HomeFilters } from "./components/HomeFilters";
import { SurpriseBagCard } from "./components/SurpriseBagCard";
import { StoreCard } from "./components/StoreCard";
import { useStores } from "../../hooks/useStores";
import { Store, SurpriseBox } from "../../services/store/store.service";

const formatPickupTime = (start: string, end: string): string => {
  const fmt = (d: string) =>
    new Date(d).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  return `${fmt(start)} - ${fmt(end)}`;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800";

export default function HomeScreen() {
  const { requestLocation } = useLocation();
  const { data: stores, isLoading, isError } = useStores();
  useEffect(() => {
    requestLocation();
  }, []);

  // Bags section: first active listing from each store that has one
  const activeBags: { store: Store; bag: SurpriseBox }[] = (stores ?? [])
    .filter((s) => s.listings.length > 0)
    .map((s) => ({ store: s, bag: s.listings[0] }))
    .slice(0, 5);

  return (
    <SafeAreaView className="flex-1 bg-[#F9F9F9]">
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      <HomeHeader />

      <ScrollView showsVerticalScrollIndicator={false}>
        <HomeSearchBar />
        <HomeHeroBanner />
        <HomeFeaturedCollections />

        {/* Awesome Bags Section */}
        <View className="mt-4">
          <Text className="px-5 text-[#111] text-[16px] font-black tracking-tight mb-4">
            Awesome bags in your area 🔥
          </Text>

          {isLoading ? (
            <View className="h-40 items-center justify-center">
              <ActivityIndicator color="#FF7F50" />
            </View>
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
                    distance="—"
                    imageUrl={bag.imageUrl ?? store.imageUrl ?? FALLBACK_IMAGE}
                    logoUrl={store.imageUrl ?? bag.imageUrl ?? FALLBACK_IMAGE}
                    leftCount={`${bag.quantity} left`}
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
          <HomeFilters />
        </View>

        {/* Available Now */}
        <View className="px-5 mt-6 mb-8">
          <Text className="text-[#111] text-[18px] font-black tracking-tight mb-5">
            Available Now ⚡
          </Text>

          {isLoading ? (
            <View className="h-40 items-center justify-center">
              <ActivityIndicator color="#FF7F50" />
            </View>
          ) : isError ? (
            <Text className="text-gray-400 text-[13px]">
              Could not load stores right now.
            </Text>
          ) : (stores ?? []).length === 0 ? (
            <Text className="text-gray-400 text-[13px]">
              No stores available right now.
            </Text>
          ) : (
            <View>
              {(stores ?? []).map((store) => {
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
                    branch={store.category ?? store.address?.split(",")[0] ?? ""}
                    price={
                      firstBag ? `${firstBag.price} SAR` : "—"
                    }
                    timeRange={
                      firstBag
                        ? formatPickupTime(
                            firstBag.pickupStart,
                            firstBag.pickupEnd,
                          )
                        : "—"
                    }
                    distance="—"
                    rating="4.9"
                    reviews="—"
                    branches="1"
                    imageUrl={store.imageUrl ?? FALLBACK_IMAGE}
                    logoUrl={store.imageUrl ?? FALLBACK_IMAGE}
                    leftCount={`${totalLeft} bag${totalLeft !== 1 ? "s" : ""} left`}
                  />
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}
