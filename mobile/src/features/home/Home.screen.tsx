import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "../../context/LocationContext";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
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
import { AllergyOnboardingSheet } from "../../components/AllergyOnboarding/AllergyOnboardingSheet";
import { DEFAULT_LISTING_IMAGE } from "../../constants/images";
import { ALLERGY_ONBOARDED_KEY } from "../../constants/storage";
import { useTranslation } from "react-i18next";
import { getLocalizedName } from "../../i18n/localizedContent";

const formatPickupTime = (start: string, end: string, language: string): string => {
  const fmt = (d: string) =>
    new Date(d).toLocaleTimeString(language === "ar" ? "ar-SA" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  return `${fmt(start)} - ${fmt(end)}`;
};

const haversineKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
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
  userLat: number,
  userLng: number,
  storeLat: number | null,
  storeLng: number | null,
  translate: (key: string, values: Record<string, number>) => string,
): string => {
  if (storeLat == null || storeLng == null) return "—";
  const km = haversineKm(userLat, userLng, storeLat, storeLng);
  return km < 1
    ? translate("common.meters", { distance: Math.round(km * 1000) })
    : translate("common.kilometers", { distance: Number(km.toFixed(1)) });
};

interface RefreshMessageProps {
  message: string;
  retryLabel: string;
  loadingLabel: string;
  isRefreshing: boolean;
  onRetry: () => void;
}

const RefreshMessage = ({
  message,
  retryLabel,
  loadingLabel,
  isRefreshing,
  onRetry,
}: RefreshMessageProps) => (
  <View className="flex-row items-center px-5">
    <Text className="text-gray-400 text-[13px] mr-3">{message}</Text>
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={retryLabel}
      activeOpacity={0.65}
      disabled={isRefreshing}
      onPress={onRetry}
      className="flex-row items-center py-1.5 px-2"
    >
      {isRefreshing ? (
        <ActivityIndicator size={14} color="#366150" />
      ) : (
        <Feather name="refresh-cw" size={14} color="#366150" />
      )}
      <Text className="ml-1.5 text-[#366150] text-[13px] font-bold">
        {isRefreshing ? loadingLabel : retryLabel}
      </Text>
    </TouchableOpacity>
  </View>
);

export default function HomeScreen() {
  const { location } = useLocation();
  const { t, i18n } = useTranslation();
  const {
    data: stores,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useStores();

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
      result = result.filter((s) => s.category === activeCuisine);
    }

    if (activePriceRange) {
      result = result.filter((s) => {
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
      const distA =
        a.latitude != null && a.longitude != null
          ? haversineKm(latitude, longitude, a.latitude, a.longitude)
          : Infinity;
      const distB =
        b.latitude != null && b.longitude != null
          ? haversineKm(latitude, longitude, b.latitude, b.longitude)
          : Infinity;
      return distA - distB;
    })
    .map((s) => ({ store: s, bag: s.listings[0] }))
    .slice(0, 5);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <HomeHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="bg-[#F9F9F9]"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isLoading}
            onRefresh={refetch}
            tintColor="#366150"
            colors={["#366150"]}
          />
        }
      >
        <HomeSearchBar />
        <HomeHeroBanner />
        <HomeFeaturedCollections />

        {/* Awesome Bags Section */}
        <View className="mt-4">
          <Text className="px-5 text-[#111] text-[16px] font-black tracking-tight mb-4">
            {t("home.awesome_bags")}
          </Text>

          {isLoading ? (
            <SurpriseBagRowSkeleton />
          ) : isError ? (
            <RefreshMessage
              message={t("home.bags_load_error")}
              retryLabel={t("common.try_again")}
              loadingLabel={t("common.loading")}
              isRefreshing={isRefetching}
              onRetry={() => void refetch()}
            />
          ) : activeBags.length === 0 ? (
            <RefreshMessage
              message={t("home.no_bags")}
              retryLabel={t("common.try_again")}
              loadingLabel={t("common.loading")}
              isRefreshing={isRefetching}
              onRetry={() => void refetch()}
            />
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
                    price={`${bag.price} ${t("common.currency")}`}
                    originalPrice={
                      bag.originalPrice
                        ? `${bag.originalPrice} ${t("common.currency")}`
                        : ""
                    }
                    timeRange={formatPickupTime(
                      bag.pickupStart,
                      bag.pickupEnd,
                      i18n.language,
                    )}
                    distance={
                      location
                        ? formatDistance(
                            location.coords.latitude,
                            location.coords.longitude,
                            store.latitude,
                            store.longitude,
                            t,
                          )
                        : "—"
                    }
                    imageUrl={
                      bag.imageUrl ?? store.imageUrl ?? DEFAULT_LISTING_IMAGE
                    }
                    logoUrl={
                      store.imageUrl ?? bag.imageUrl ?? DEFAULT_LISTING_IMAGE
                    }
                    leftCount={t("map.bag_left", { count: bag.quantity })}
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
            {t("home.all_stores")}
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
            {t("home.available_now")}
          </Text>

          {isLoading ? (
            <StoreListSkeleton count={3} />
          ) : isError ? (
            <View className="-mx-5">
              <RefreshMessage
                message={t("home.stores_load_error")}
                retryLabel={t("common.try_again")}
                loadingLabel={t("common.loading")}
                isRefreshing={isRefetching}
                onRetry={() => void refetch()}
              />
            </View>
          ) : filteredStores.length === 0 ? (
            <Text className="text-gray-400 text-[13px]">
              {t("home.no_filter_matches")}
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
                    title={getLocalizedName(store, i18n.language)}
                    branch={
                      store.category ?? store.address?.split(",")[0] ?? ""
                    }
                    price={
                      firstBag
                        ? `${firstBag.price} ${t("common.currency")}`
                        : "—"
                    }
                    timeRange={
                      firstBag
                        ? formatPickupTime(
                            firstBag.pickupStart,
                            firstBag.pickupEnd,
                            i18n.language,
                          )
                        : "—"
                    }
                    distance={
                      location
                        ? formatDistance(
                            location.coords.latitude,
                            location.coords.longitude,
                            store.latitude,
                            store.longitude,
                            t,
                          )
                        : "—"
                    }
                    imageUrl={
                      store.listings[0]?.imageUrl ??
                      store.imageUrl ??
                      DEFAULT_LISTING_IMAGE
                    }
                    logoUrl={
                      store.imageUrl ??
                      store.listings[0]?.imageUrl ??
                      DEFAULT_LISTING_IMAGE
                    }
                    leftCount={t("map.bag_left", { count: totalLeft })}
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
