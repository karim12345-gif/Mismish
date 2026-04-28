import React, { useEffect, useRef } from "react";
import {
  Animated,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFavorites } from "../../hooks/useFavorites";
import { useStores } from "../../hooks/useStores";

const CORAL = "#FF7F50";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function FavoritesModal({ visible, onClose }: Props) {
  const navigation = useNavigation<any>();
  const { isFavorite, toggleFavorite, favoriteIds } = useFavorites();
  const { data: stores = [] } = useStores();
  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 13,
      }).start();
    } else {
      slideAnim.setValue(600);
    }
  }, [visible]);

  const favoriteStores = stores.filter((s) => favoriteIds.has(s.id));

  const handleNavigate = (storeId: number) => {
    onClose();
    setTimeout(() => navigation.push("SurpriseBag", { storeId }), 200);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header row */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>My Favorites</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="x" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {favoriteStores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={48} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart on any restaurant to save it here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={favoriteStores}
            keyExtractor={(s) => String(s.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const bag = item.listings?.[0];
              const savings = bag?.originalPrice
                ? Math.round((1 - bag.price / bag.originalPrice) * 100)
                : null;

              return (
                <TouchableOpacity
                  onPress={() => handleNavigate(item.id)}
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
                      <View style={styles.rowPriceRow}>
                        <Text style={styles.rowPrice}>SAR {bag.price}</Text>
                        {savings && (
                          <View style={styles.savingsBadge}>
                            <Text style={styles.savingsText}>-{savings}%</Text>
                          </View>
                        )}
                      </View>
                    ) : (
                      <Text style={styles.rowUnavailable}>No bags right now</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => toggleFavorite(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={isFavorite(item.id) ? "heart" : "heart-outline"}
                      size={22}
                      color={isFavorite(item.id) ? CORAL : "#ddd"}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingBottom: 40,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    color: "#111",
    fontWeight: "900",
    fontSize: 18,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: "#111",
    fontWeight: "800",
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#aaa",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  rowImage: {
    width: 56,
    height: 56,
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
    fontSize: 14,
    marginBottom: 2,
  },
  rowMeta: {
    color: "#888",
    fontSize: 12,
    marginBottom: 4,
  },
  rowPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowPrice: {
    color: CORAL,
    fontWeight: "900",
    fontSize: 13,
  },
  savingsBadge: {
    backgroundColor: "#FFF0EB",
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  savingsText: {
    color: CORAL,
    fontWeight: "800",
    fontSize: 10,
  },
  rowUnavailable: {
    color: "#bbb",
    fontSize: 12,
  },
});
