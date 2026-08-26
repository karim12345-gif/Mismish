import { Platform, StyleSheet } from "react-native";
import { DEFAULT_LISTING_IMAGE } from "../../constants/images";

export const CORAL = "#FF7F50";
export const FALLBACK_IMAGE = DEFAULT_LISTING_IMAGE;

export const styles = StyleSheet.create({
  // ── Root ─────────────────────────────────────────────────────────────────
  mapContainer: {
    flex: 1,
  },
  markerImage: {
    width: "100%",
    height: "100%",
  },
  // ── StoreBottomCard ──────────────────────────────────────────────────────
  cardContainer: {
    position: "absolute",
    bottom: 98,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  favoriteButton: {
    position: "absolute",
    top: 14,
    right: 50,
    zIndex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 1,
  },
  closeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  storeRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 14,
    paddingRight: 32,
  },
  storeImage: {
    width: 54,
    height: 54,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: "#F3F4F6",
  },
  storeName: {
    color: "#111",
    fontWeight: "900" as const,
    fontSize: 16,
  },
  storeMeta: {
    color: "#888",
    fontWeight: "500" as const,
    fontSize: 12,
    marginTop: 2,
  },
  bagRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  priceRow: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    gap: 6,
  },
  price: {
    color: "#111",
    fontWeight: "900" as const,
    fontSize: 17,
  },
  originalPrice: {
    color: "#bbb",
    fontWeight: "500" as const,
    fontSize: 12,
    textDecorationLine: "line-through" as const,
  },
  savingsBadge: {
    backgroundColor: "#FFF0EB",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  savingsText: {
    color: CORAL,
    fontWeight: "800" as const,
    fontSize: 11,
  },
  quantityText: {
    color: "#888",
    fontSize: 12,
    marginTop: 3,
  },
  viewBagButton: {
    backgroundColor: CORAL,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 12,
    shadowColor: CORAL,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  viewBagText: {
    color: "#fff",
    fontWeight: "900" as const,
    fontSize: 14,
  },
  noBagsText: {
    color: "#aaa",
    fontSize: 13,
    paddingTop: 4,
  },

  // ── Markers ──────────────────────────────────────────────────────────────
  clusterBubble: {
    backgroundColor: CORAL,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: CORAL,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 7,
  },
  clusterCount: {
    color: "#fff",
    fontWeight: "900" as const,
  },
  storePin: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    overflow: "hidden" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    backgroundColor: "#F3F4F6",
  },

  // ── Top overlay ──────────────────────────────────────────────────────────
  topOverlay: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 16,
    right: 16,
    zIndex: 5,
  },
  searchBar: {
    backgroundColor: "#fff",
    borderRadius: 16,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 14,
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#111",
  },
  filterSortChevron: {
    marginLeft: 3,
  },
  filterChipIcon: {
    marginRight: 5,
  },
  filterRow: {
    paddingTop: 10,
    paddingBottom: 4,
    gap: 8,
  },
  filterSort: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  filterChip: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  filterChipActive: {
    backgroundColor: CORAL,
  },
  filterChipLabel: {
    color: "#111",
    fontWeight: "700" as const,
    fontSize: 13,
  },
  filterChipLabelActive: {
    color: "#fff",
  },

  // ── Cuisine row ──────────────────────────────────────────────────────────
  cuisineRow: {
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
  },
  cuisineChip: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cuisineChipActive: {
    backgroundColor: CORAL,
  },
  cuisineChipLabel: {
    color: "#111",
    fontWeight: "600" as const,
    fontSize: 12,
  },
  cuisineChipLabelActive: {
    color: "#fff",
  },

  // ── Search results count ─────────────────────────────────────────────────
  resultsBar: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  resultsText: {
    color: "#888",
    fontSize: 12,
    fontWeight: "500" as const,
  },

  // ── Location FAB ─────────────────────────────────────────────────────────
  locationFab: {
    position: "absolute",
    right: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#fff",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 5,
  },
  locationFabDefault: {
    bottom: 110,
  },
  locationFabWithCard: {
    bottom: 260,
  },
});
