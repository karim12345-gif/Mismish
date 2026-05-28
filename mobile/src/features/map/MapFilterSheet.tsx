import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Switch,
  ScrollView,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

const CORAL = "#FF7F50";

export type MapAvailability = "now" | "later_today" | "tomorrow";
export type MapPriceRange = "" | "1-15" | "16-25" | "25+";
export type MapSortOption = "nearby" | "earliest_pickup";

export interface MapFilters {
  availability: MapAvailability[];
  favoritesOnly: boolean;
  priceRange: MapPriceRange;
  sortBy: MapSortOption;
  cuisine: string;
}

export const DEFAULT_MAP_FILTERS: MapFilters = {
  availability: ["now"],
  favoritesOnly: false,
  priceRange: "",
  sortBy: "nearby",
  cuisine: "",
};

interface Props {
  visible: boolean;
  current: MapFilters;
  categories: string[];
  onClose: () => void;
  onApply: (f: MapFilters) => void;
}

const CUISINE_EMOJI: Record<string, string> = {
  Restaurant: "🍽️",
  "Café": "☕",
  Bakery: "🥐",
  Grocery: "🛒",
  Sweets: "🍬",
  "Fast Food": "🍔",
  Pizza: "🍕",
  Sandwiches: "🥪",
  "Juice & Smoothies": "🥤",
  "Sushi / Japanese": "🍱",
  Other: "🛍️",
};

const AVAILABILITY_OPTIONS: { value: MapAvailability; label: string; icon?: boolean }[] = [
  { value: "now", label: "Now", icon: true },
  { value: "later_today", label: "Later Today" },
  { value: "tomorrow", label: "Tomorrow" },
];

const PRICE_RANGES: { value: MapPriceRange; label: string }[] = [
  { value: "1-15", label: "﷼ 1 – ﷼ 15" },
  { value: "16-25", label: "﷼ 16 – ﷼ 25" },
  { value: "25+", label: "﷼ 25+" },
];

const SORT_OPTIONS: { value: MapSortOption; label: string }[] = [
  { value: "nearby", label: "Nearby" },
  { value: "earliest_pickup", label: "Earliest Pickup Time" },
];

export function MapFilterSheet({ visible, current, categories, onClose, onApply }: Props) {
  const [filters, setFilters] = useState<MapFilters>(current);

  useEffect(() => { setFilters(current); }, [current, visible]);

  const toggleAvailability = (val: MapAvailability) => {
    setFilters(f => ({
      ...f,
      availability: f.availability.includes(val)
        ? f.availability.filter(a => a !== val)
        : [...f.availability, val],
    }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_MAP_FILTERS);
    onApply(DEFAULT_MAP_FILTERS);
    onClose();
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const activeCount = [
    filters.availability.length !== DEFAULT_MAP_FILTERS.availability.length ||
      !filters.availability.every(a => DEFAULT_MAP_FILTERS.availability.includes(a)),
    filters.favoritesOnly,
    !!filters.priceRange,
    filters.cuisine !== "",
  ].filter(Boolean).length;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {/* When it's available */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>When it's available</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Feather name="x" size={16} color="#555" />
                </TouchableOpacity>
              </View>

              {AVAILABILITY_OPTIONS.map(opt => {
                const checked = filters.availability.includes(opt.value);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={styles.checkRow}
                    onPress={() => toggleAvailability(opt.value)}
                  >
                    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                      {checked && <Feather name="check" size={12} color="#fff" />}
                    </View>
                    <Text style={styles.checkLabel}>{opt.label}</Text>
                    {opt.icon && (
                      <View style={styles.nowBadge}>
                        <Ionicons name="time-outline" size={13} color={CORAL} />
                        <Text style={styles.nowBadgeText}>Live</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.divider} />

            {/* Favorites */}
            <View style={styles.section}>
              <View style={styles.favRow}>
                <Text style={styles.sectionTitle}>Favorites Only</Text>
                <Switch
                  value={filters.favoritesOnly}
                  onValueChange={v => setFilters(f => ({ ...f, favoritesOnly: v }))}
                  trackColor={{ false: "#E5E7EB", true: CORAL }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Cuisine */}
            {categories.length > 0 && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Cuisine</Text>
                  <View style={styles.cuisineGrid}>
                    {categories.map(cat => {
                      const active = filters.cuisine === cat;
                      const emoji = CUISINE_EMOJI[cat] ?? "🍴";
                      return (
                        <TouchableOpacity
                          key={cat}
                          onPress={() =>
                            setFilters(f => ({ ...f, cuisine: active ? "" : cat }))
                          }
                          style={[styles.cuisineTile, active && styles.cuisineTileActive]}
                          activeOpacity={0.75}
                        >
                          <View style={[styles.cuisineEmojiBg, active && styles.cuisineEmojiBgActive]}>
                            <Text style={styles.cuisineEmoji}>{emoji}</Text>
                          </View>
                          <Text
                            style={[styles.cuisineTileLabel, active && styles.cuisineTileLabelActive]}
                            numberOfLines={1}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
                <View style={styles.divider} />
              </>
            )}

            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <View style={styles.priceRow}>
                {PRICE_RANGES.map(r => {
                  const active = filters.priceRange === r.value;
                  return (
                    <TouchableOpacity
                      key={r.value}
                      onPress={() =>
                        setFilters(f => ({
                          ...f,
                          priceRange: active ? "" : r.value,
                        }))
                      }
                      style={[styles.priceChip, active && styles.priceChipActive]}
                    >
                      <Text style={[styles.priceChipLabel, active && styles.priceChipLabelActive]}>
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Sort By */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              {SORT_OPTIONS.map(opt => {
                const selected = filters.sortBy === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={styles.radioRow}
                    onPress={() => setFilters(f => ({ ...f, sortBy: opt.value }))}
                  >
                    <View style={[styles.radio, selected && styles.radioSelected]}>
                      {selected && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioLabel}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
              <Text style={styles.resetLabel}>
                Reset{activeCount > 0 ? ` (${activeCount})` : ""}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleApply} style={styles.applyBtn}>
              <Text style={styles.applyLabel}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: 0,
  },
  section: { paddingHorizontal: 24, paddingVertical: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#111" },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f3f3",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: "#F3F3F3", marginHorizontal: 24 },

  // Checkboxes
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  checkboxChecked: { backgroundColor: CORAL, borderColor: CORAL },
  checkLabel: { fontSize: 15, fontWeight: "600", color: "#111", flex: 1 },
  nowBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FFF4F0",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  nowBadgeText: { fontSize: 11, fontWeight: "700", color: CORAL },

  // Favorites
  favRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  // Cuisine
  cuisineGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  cuisineTile: {
    width: "30%",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: "#fff",
  },
  cuisineTileActive: { borderColor: CORAL, backgroundColor: "#FFF4F0" },
  cuisineEmojiBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  cuisineEmojiBgActive: { backgroundColor: "#FFE8DF" },
  cuisineEmoji: { fontSize: 22 },
  cuisineTileLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#444",
    textAlign: "center",
  },
  cuisineTileLabelActive: { color: CORAL },

  // Price
  priceRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  priceChip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  priceChipActive: { borderColor: CORAL, backgroundColor: "#FFF4F0" },
  priceChipLabel: { fontSize: 13, fontWeight: "700", color: "#333" },
  priceChipLabelActive: { color: CORAL },

  // Sort
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  radioSelected: { borderColor: CORAL },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CORAL,
  },
  radioLabel: { fontSize: 15, fontWeight: "600", color: "#111" },

  // Actions
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 44,
    borderTopWidth: 1,
    borderTopColor: "#F3F3F3",
    backgroundColor: "#fff",
  },
  resetBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: CORAL,
    alignItems: "center",
    justifyContent: "center",
  },
  resetLabel: { color: CORAL, fontWeight: "700", fontSize: 15 },
  applyBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: CORAL,
    alignItems: "center",
    justifyContent: "center",
  },
  applyLabel: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
