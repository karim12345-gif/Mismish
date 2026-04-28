import React, { useEffect, useRef } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StoreBottomCardProps } from "./MapScreen.types";
import { styles, FALLBACK_IMAGE, CORAL } from "./MapScreen.styles";

export function StoreBottomCard({
  store,
  isFavorite,
  onClose,
  onToggleFavorite,
}: StoreBottomCardProps) {
  const navigation = useNavigation<any>();
  const slideAnim = useRef(new Animated.Value(250)).current;

  useEffect(() => {
    slideAnim.setValue(250);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 12,
    }).start();
  }, [store.id]);

  const bag = store.listings?.[0];
  const savings = bag?.originalPrice
    ? Math.round((1 - bag.price / bag.originalPrice) * 100)
    : null;

  return (
    <Animated.View
      style={[styles.cardContainer, { transform: [{ translateY: slideAnim }] }]}
    >
      <View style={styles.card}>
        {/* Close */}
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={styles.closeIcon}>
            <Feather name="x" size={14} color="#666" />
          </View>
        </TouchableOpacity>

        {/* Favorite */}
        <TouchableOpacity
          onPress={() => onToggleFavorite(store.id)}
          style={styles.favoriteButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite ? CORAL : "#bbb"}
          />
        </TouchableOpacity>

        <View style={styles.storeRow}>
          <Image
            source={{ uri: store.imageUrl ?? FALLBACK_IMAGE }}
            style={styles.storeImage}
            resizeMode="cover"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.storeName}>{store.name}</Text>
            <Text style={styles.storeMeta}>
              {store.category}
              {store.address ? ` · ${store.address.split(",")[0]}` : ""}
            </Text>
          </View>
        </View>

        {bag ? (
          <View style={styles.bagRow}>
            <View>
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
              <Text style={styles.quantityText}>
                {bag.quantity} bag{bag.quantity !== 1 ? "s" : ""} left
              </Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                navigation.push("SurpriseBag", { storeId: store.id })
              }
              style={styles.viewBagButton}
            >
              <Text style={styles.viewBagText}>View Bag</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.noBagsText}>No bags available right now</Text>
        )}
      </View>
    </Animated.View>
  );
}
