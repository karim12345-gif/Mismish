import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useStores } from "../../hooks/useStores";
import { StoreCard } from "./components/StoreCard";
import { StoreListSkeleton } from "./components/StoreCardSkeleton";
import { SortBottomSheet, SortOption } from "./components/SortBottomSheet";
import { CuisineBottomSheet } from "./components/CuisineBottomSheet";
import { PriceBottomSheet, PriceRange } from "./components/PriceBottomSheet";
import { Store } from "../../services/store/store.service";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DEFAULT_LISTING_IMAGE } from "../../constants/images";

const CORAL = "#FF7F50";
const BANNER_BG = "#FDF8EC";

const FLOAT_ITEMS = [
  { emoji: "🍩", color: "#3D1C5A", pos: { top: 18, left: 28 } },
  { emoji: "🍔", color: "#E8C840", pos: { top: 12, right: 24 } },
  { emoji: "🥐", color: "#F4A0B0", pos: { bottom: 16, left: 48 } },
  { emoji: "🍱", color: "#F4A0B0", pos: { bottom: 20, right: 50 } },
];

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

function FloatingBadge({
  emoji,
  color,
  pos,
}: {
  emoji: string;
  color: string;
  pos: object;
}) {
  return (
    <View style={[styles.floatBadge, { backgroundColor: color }, pos as any]}>
      <Text style={styles.floatEmoji}>{emoji}</Text>
    </View>
  );
}

export default function ElevenUnderScreen() {
  const navigation = useNavigation<any>();
  const { data: stores, isLoading } = useStores();

  const [sortBy, setSortBy] = useState<SortOption>("");
  const [activeCuisine, setActiveCuisine] = useState("");
  const [activePriceRange, setActivePriceRange] = useState<PriceRange>("");
  const [sortOpen, setSortOpen] = useState(false);
  const [cuisineOpen, setCuisineOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  const categories = useMemo(
    () =>
      [
        ...new Set(
          (stores ?? []).map((s) => s.category).filter(Boolean) as string[],
        ),
      ].sort(),
    [stores],
  );

  const filteredStores = useMemo(() => {
    let result = (stores ?? []).filter((s) =>
      s.listings.some((l) => l.price <= 11),
    );

    if (activeCuisine)
      result = result.filter((s) => s.category === activeCuisine);

    if (activePriceRange) {
      result = result.filter((s) => {
        const price = s.listings.find((l) => l.price <= 11)?.price ?? 0;
        if (activePriceRange === "1-15") return price <= 15;
        if (activePriceRange === "16-25") return price >= 16 && price <= 25;
        if (activePriceRange === "25+") return price > 25;
        return true;
      });
    }

    if (sortBy === "pickup_time") {
      result = [...result].sort((a, b) => {
        const aEnd = a.listings[0]?.pickupEnd
          ? new Date(a.listings[0].pickupEnd).getTime()
          : Infinity;
        const bEnd = b.listings[0]?.pickupEnd
          ? new Date(b.listings[0].pickupEnd).getTime()
          : Infinity;
        return aEnd - bEnd;
      });
    }

    return result;
  }, [stores, activeCuisine, activePriceRange, sortBy]);

  const sortActive = sortBy !== "";
  const cuisineActive = activeCuisine !== "";
  const priceActive = activePriceRange !== "";

  const renderStore = ({ item: store }: { item: Store }) => {
    const cheapBag = store.listings.filter((l) => l.price <= 11)[0];
    const totalLeft = store.listings.reduce((s, l) => s + l.quantity, 0);
    return (
      <StoreCard
        storeId={store.id}
        title={store.name}
        branch={store.category ?? store.address?.split(",")[0] ?? ""}
        price={cheapBag ? `${cheapBag.price} SAR` : "—"}
        timeRange={
          cheapBag
            ? `${fmtTime(cheapBag.pickupStart)} - ${fmtTime(cheapBag.pickupEnd)}`
            : "—"
        }
        distance={store.address?.split(",")[0] ?? "—"}
        rating={Number(((store.id % 5) * 0.1 + 4.5).toFixed(1))}
        reviewCount={120 + store.id * 14}
        hasListings={Boolean(cheapBag)}
        imageUrl={cheapBag?.imageUrl ?? store.imageUrl ?? DEFAULT_LISTING_IMAGE}
        logoUrl={store.imageUrl ?? cheapBag?.imageUrl ?? DEFAULT_LISTING_IMAGE}
        leftCount={`${totalLeft} bag${totalLeft !== 1 ? "s" : ""} left`}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={BANNER_BG} />

      {/* Banner header */}
      <View style={styles.banner}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={22} color="#111" />
        </TouchableOpacity>

        <View style={styles.bannerContent}>
          <Text style={styles.bannerLeftText}>11 and under</Text>

          <View style={styles.badgeWrap}>
            <View style={styles.badge}>
              <Text style={styles.badgeCurrency}>﷼</Text>
              <Text style={styles.badgeNumber}>11</Text>
            </View>
            {FLOAT_ITEMS.map((item, i) => (
              <FloatingBadge key={i} {...item} />
            ))}
          </View>

          <Text style={styles.bannerRightText}>11 وأقل</Text>
        </View>

        {/* Search bar */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Search")}
          style={styles.searchBar}
          activeOpacity={0.8}
        >
          <Feather
            name="search"
            size={16}
            color="#999"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.searchPlaceholder}>
            Search for restaurants or meals
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={styles.filtersWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          <TouchableOpacity
            onPress={() => setSortOpen(true)}
            style={[styles.chip, sortActive && styles.chipActive]}
          >
            <MaterialCommunityIcons
              name="sort-variant"
              size={15}
              color={sortActive ? CORAL : "#444"}
              style={{ marginRight: 5 }}
            />
            <Text
              style={[styles.chipLabel, sortActive && styles.chipLabelActive]}
            >
              Sort By
            </Text>
            {sortActive ? (
              <View style={styles.badge1}>
                <Text style={styles.badge1Text}>1</Text>
              </View>
            ) : (
              <Feather name="chevron-down" size={13} color="#666" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCuisineOpen(true)}
            style={[styles.chip, cuisineActive && styles.chipActive]}
          >
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={13}
              color={cuisineActive ? CORAL : "#555"}
              style={{ marginRight: 5 }}
            />
            <Text
              style={[
                styles.chipLabel,
                cuisineActive && styles.chipLabelActive,
              ]}
            >
              {cuisineActive ? activeCuisine : "Cuisine"}
            </Text>
            {cuisineActive ? (
              <TouchableOpacity
                onPress={() => setActiveCuisine("")}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Feather name="x" size={12} color={CORAL} />
              </TouchableOpacity>
            ) : (
              <Feather name="chevron-down" size={13} color="#666" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPriceOpen(true)}
            style={[styles.chip, priceActive && styles.chipActive]}
          >
            <Feather
              name="dollar-sign"
              size={13}
              color={priceActive ? CORAL : "#555"}
              style={{ marginRight: 2 }}
            />
            <Text
              style={[styles.chipLabel, priceActive && styles.chipLabelActive]}
            >
              {priceActive ? activePriceRange : "Price"}
            </Text>
            {priceActive ? (
              <TouchableOpacity
                onPress={() => setActivePriceRange("")}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Feather name="x" size={12} color={CORAL} />
              </TouchableOpacity>
            ) : (
              <Feather name="chevron-down" size={13} color="#666" />
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Store list */}
      {isLoading ? (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <StoreListSkeleton count={3} />
        </ScrollView>
      ) : filteredStores.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            No stores with bags under ﷼11 right now.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredStores}
          keyExtractor={(s) => String(s.id)}
          renderItem={renderStore}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <SortBottomSheet
        visible={sortOpen}
        current={sortBy}
        onClose={() => setSortOpen(false)}
        onApply={setSortBy}
      />
      <CuisineBottomSheet
        visible={cuisineOpen}
        current={activeCuisine}
        categories={categories}
        onClose={() => setCuisineOpen(false)}
        onApply={setActiveCuisine}
      />
      <PriceBottomSheet
        visible={priceOpen}
        current={activePriceRange}
        onClose={() => setPriceOpen(false)}
        onApply={setActivePriceRange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },

  // Banner
  banner: { backgroundColor: BANNER_BG, paddingBottom: 16 },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
    marginTop: 12,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  bannerLeftText: {
    color: CORAL,
    fontWeight: "900",
    fontSize: 18,
    flex: 1,
    flexShrink: 1,
  },
  badgeWrap: {
    position: "relative",
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5A623",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#F5A623",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  badgeCurrency: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  badgeNumber: { color: "#fff", fontSize: 32, fontWeight: "900" },
  floatBadge: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  floatEmoji: { fontSize: 16 },
  bannerRightText: {
    color: CORAL,
    fontWeight: "900",
    fontSize: 18,
    flex: 1,
    flexShrink: 1,
    textAlign: "right",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  searchPlaceholder: { color: "#aaa", fontSize: 14, fontWeight: "500" },

  // Filters
  filtersWrap: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F3F3",
  },
  filtersRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#fff",
  },
  chipActive: { borderColor: CORAL },
  chipLabel: { color: "#222", fontSize: 13, fontWeight: "700", marginRight: 4 },
  chipLabelActive: { color: CORAL },
  badge1: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: CORAL,
    alignItems: "center",
    justifyContent: "center",
  },
  badge1Text: { color: "#fff", fontSize: 10, fontWeight: "800" },

  // Empty
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#aaa", fontSize: 14, fontWeight: "500" },
});
