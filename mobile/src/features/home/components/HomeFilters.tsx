import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Store } from "../../../services/store/store.service";
import { SortBottomSheet, SortOption } from "./SortBottomSheet";
import { CuisineBottomSheet } from "./CuisineBottomSheet";
import { PriceBottomSheet, PriceRange } from "./PriceBottomSheet";

const CORAL = "#FF7F50";

interface Props {
  stores: Store[];
  sortBy: SortOption;
  activeCuisine: string;
  activePriceRange: PriceRange;
  onSortChange: (s: SortOption) => void;
  onCuisineChange: (c: string) => void;
  onPriceChange: (p: PriceRange) => void;
}

export const HomeFilters = ({
  stores,
  sortBy,
  activeCuisine,
  activePriceRange,
  onSortChange,
  onCuisineChange,
  onPriceChange,
}: Props) => {
  const [sortOpen, setSortOpen] = useState(false);
  const [cuisineOpen, setCuisineOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  const categories = [...new Set(stores.map(s => s.category).filter(Boolean) as string[])].sort();

  const sortActive = sortBy !== "";
  const cuisineActive = activeCuisine !== "";
  const priceActive = activePriceRange !== "";

  return (
    <>
      <View className="flex-row">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 10 }}
        >
          {/* Sort By */}
          <TouchableOpacity
            onPress={() => setSortOpen(true)}
            className="flex-row items-center border rounded-full px-3 py-1.5 bg-white shadow-sm shadow-black/5"
            style={{ borderColor: sortActive ? CORAL : "#E5E7EB" }}
          >
            <MaterialCommunityIcons
              name="sort-variant"
              size={16}
              color={sortActive ? CORAL : "#444"}
              style={{ marginRight: 6 }}
            />
            <Text
              className="text-[13px] font-bold mr-1"
              style={{ color: sortActive ? CORAL : "#222" }}
            >
              Sort By
            </Text>
            {sortActive ? (
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: CORAL,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>1</Text>
              </View>
            ) : (
              <Feather name="chevron-down" size={14} color="#666" />
            )}
          </TouchableOpacity>

          {/* Cuisine */}
          <TouchableOpacity
            onPress={() => setCuisineOpen(true)}
            className="flex-row items-center border rounded-full px-3 py-1.5 bg-white shadow-sm shadow-black/5"
            style={{ borderColor: cuisineActive ? CORAL : "#E5E7EB" }}
          >
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={14}
              color={cuisineActive ? CORAL : "#555"}
              style={{ marginRight: 6 }}
            />
            <Text
              className="text-[13px] font-bold mr-1"
              style={{ color: cuisineActive ? CORAL : "#222" }}
            >
              {cuisineActive ? activeCuisine : "Cuisine"}
            </Text>
            {cuisineActive ? (
              <TouchableOpacity
                onPress={() => onCuisineChange("")}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Feather name="x" size={13} color={CORAL} />
              </TouchableOpacity>
            ) : (
              <Feather name="chevron-down" size={14} color="#666" />
            )}
          </TouchableOpacity>

          {/* Price */}
          <TouchableOpacity
            onPress={() => setPriceOpen(true)}
            className="flex-row items-center border rounded-full px-3 py-1.5 bg-white shadow-sm shadow-black/5"
            style={{ borderColor: priceActive ? CORAL : "#E5E7EB" }}
          >
            <Feather
              name="dollar-sign"
              size={14}
              color={priceActive ? CORAL : "#555"}
              style={{ marginRight: 2 }}
            />
            <Text
              className="text-[13px] font-bold mr-1"
              style={{ color: priceActive ? CORAL : "#222" }}
            >
              {priceActive ? activePriceRange : "Price"}
            </Text>
            {priceActive ? (
              <TouchableOpacity
                onPress={() => onPriceChange("")}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Feather name="x" size={13} color={CORAL} />
              </TouchableOpacity>
            ) : (
              <Feather name="chevron-down" size={14} color="#666" />
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      <SortBottomSheet
        visible={sortOpen}
        current={sortBy}
        onClose={() => setSortOpen(false)}
        onApply={onSortChange}
      />
      <CuisineBottomSheet
        visible={cuisineOpen}
        current={activeCuisine}
        categories={categories}
        onClose={() => setCuisineOpen(false)}
        onApply={onCuisineChange}
      />
      <PriceBottomSheet
        visible={priceOpen}
        current={activePriceRange}
        onClose={() => setPriceOpen(false)}
        onApply={onPriceChange}
      />
    </>
  );
};
