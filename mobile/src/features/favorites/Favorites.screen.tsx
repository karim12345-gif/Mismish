import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFavorites } from "../../hooks/useFavorites";
import { useStores } from "../../hooks/useStores";
import { Store } from "../../services/store/store.service";

const CORAL = "#FF7F50";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400";

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites();
  const { data: stores = [] } = useStores();

  const favoriteStores = stores.filter((s) => favoriteIds.has(s.id));

  const renderItem = ({ item }: { item: Store }) => {
    const bag = item.listings?.[0];
    const savings = bag?.originalPrice
      ? Math.round((1 - bag.price / bag.originalPrice) * 100)
      : null;

    return (
      <TouchableOpacity
        onPress={() => navigation.push("SurpriseBag", { storeId: item.id })}
        activeOpacity={0.85}
        style={styles.row}
      >
        <Image
          source={{ uri: item.imageUrl ?? FALLBACK_IMAGE }}
          style={styles.rowImage}
          resizeMode="cover"
        />

        <View style={styles.rowBody}>
          <Text style={styles.rowName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.rowMeta} numberOfLines={1}>
            {item.category}
            {item.address ? ` · ${item.address.split(",")[0]}` : ""}
          </Text>

          {bag ? (
            <View style={styles.priceRow}>
              <Text style={styles.price}>SAR {bag.price}</Text>
              {bag.originalPrice && (
                <Text style={styles.originalPrice}>SAR {bag.originalPrice}</Text>
              )}
              {savings && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>-{savings}%</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.noBags}>No bags available</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => toggleFavorite(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isFavorite(item.id) ? "heart" : "heart-outline"}
            size={22}
            color={isFavorite(item.id) ? CORAL : "#ddd"}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <View style={{ width: 22 }} />
      </View>

      {favoriteStores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart on any restaurant to save it here.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.exploreButton}
          >
            <Text style={styles.exploreButtonText}>Explore Restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favoriteStores}
          keyExtractor={(s) => String(s.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F3F3",
  },
  headerTitle: {
    color: "#111",
    fontWeight: "900",
    fontSize: 17,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  separator: {
    height: 10,
  },
  rowImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    marginRight: 12,
  },
  rowBody: {
    flex: 1,
    marginRight: 12,
  },
  rowName: {
    color: "#111",
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 3,
  },
  rowMeta: {
    color: "#888",
    fontSize: 12,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  price: {
    color: CORAL,
    fontWeight: "900",
    fontSize: 14,
  },
  originalPrice: {
    color: "#bbb",
    fontSize: 12,
    textDecorationLine: "line-through",
  },
  savingsBadge: {
    backgroundColor: "#FFF0EB",
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  savingsText: {
    color: CORAL,
    fontWeight: "800",
    fontSize: 10,
  },
  noBags: {
    color: "#bbb",
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: "#111",
    fontWeight: "900",
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: CORAL,
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  exploreButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
  },
});
