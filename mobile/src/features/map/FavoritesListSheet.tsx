import React, { useEffect, useRef } from "react";
import {
  Animated,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Store } from "../../services/store/store.service";
import { DEFAULT_LISTING_IMAGE } from "../../constants/images";

const CORAL = "#FF7F50";

interface Props {
  stores: Store[];
  favoriteIds: Set<number>;
  onToggleFavorite: (storeId: number) => void;
  onSelectStore: (store: Store) => void;
}

export function FavoritesListSheet({
  stores,
  favoriteIds,
  onToggleFavorite,
  onSelectStore,
}: Props) {
  const slideAnim = useRef(new Animated.Value(220)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 13,
    }).start();
  }, []);

  const favoriteStores = stores.filter((s) => favoriteIds.has(s.id));

  return (
    <Animated.View
      style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
    >
      {/* Drag handle */}
      <View style={styles.handle} />

      <Text style={styles.title}>
        {favoriteStores.length > 0
          ? `${favoriteStores.length} Saved Restaurant${favoriteStores.length !== 1 ? "s" : ""}`
          : "No Favorites Yet"}
      </Text>

      {favoriteStores.length === 0 ? (
        <Text style={styles.emptyText}>
          Tap the heart on any restaurant to save it here.
        </Text>
      ) : (
        <FlatList
          data={favoriteStores}
          keyExtractor={(s) => String(s.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const bag = item.listings?.[0];
            const hasListings = !!bag;
            return (
              <TouchableOpacity
                onPress={() => hasListings && onSelectStore(item)}
                disabled={!hasListings}
                activeOpacity={hasListings ? 0.85 : 1}
                style={[styles.card, !hasListings && { opacity: 0.45 }]}
              >
                {/* Store image */}
                <Image
                  source={{
                    uri:
                      item.listings[0]?.imageUrl ??
                      item.imageUrl ??
                      DEFAULT_LISTING_IMAGE,
                  }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />

                {/* Heart remove button */}
                <TouchableOpacity
                  onPress={() => onToggleFavorite(item.id)}
                  style={styles.heartBtn}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="heart" size={15} color={CORAL} />
                </TouchableOpacity>

                <View style={styles.cardBody}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.cardMeta} numberOfLines={1}>
                    {item.category ?? "—"}
                  </Text>
                  {bag ? (
                    <Text style={styles.cardPrice}>SAR {bag.price}</Text>
                  ) : (
                    <Text style={styles.cardUnavailable}>No bags</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: 98,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    color: "#111",
    fontWeight: "900",
    fontSize: 15,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  emptyText: {
    color: "#aaa",
    fontSize: 13,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 130,
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardImage: {
    width: "100%",
    height: 80,
    backgroundColor: "#F3F4F6",
  },
  heartBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  cardBody: {
    padding: 8,
  },
  cardName: {
    color: "#111",
    fontWeight: "800",
    fontSize: 12,
    marginBottom: 2,
  },
  cardMeta: {
    color: "#888",
    fontSize: 11,
    marginBottom: 4,
  },
  cardPrice: {
    color: CORAL,
    fontWeight: "900",
    fontSize: 12,
  },
  cardUnavailable: {
    color: "#bbb",
    fontSize: 11,
  },
});
