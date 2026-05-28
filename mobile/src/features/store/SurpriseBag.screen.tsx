import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Modal,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { InView } from "../../components/Inview/inView.component";
import { StoreItemCard } from "./StoreItemCard";
import { HowMismishWorksModal } from "../../components/HowMismishWorksModal";
import { SurpriseBagBottomSheet } from "./SurpriseBagBottomSheet";
import { AvailabilityTimeBottomSheet } from "./AvailabilityTimeBottomSheet";
import { useCart } from "../../context/CartContext";
import { useStoreInventory } from "../../hooks/useStoreInventory";
import { useStores } from "../../hooks/useStores";
import { useFavorites } from "../../hooks/useFavorites";
import { AuthenticatedStackParamList } from "../../navigation/AuthenticatedNavigator";
import { SurpriseBagSkeleton } from "./SurpriseBagSkeleton";

const { width } = Dimensions.get("window");

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800";

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

// Label is based on pickupStart so cross-midnight windows (e.g. 11 PM – 2 AM) show "Today"
const pickupDayLabel = (pickupStart: string): "Today" | "Tomorrow" => {
  const d = new Date(pickupStart);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
    ? "Today"
    : "Tomorrow";
};

const formatPickupTime = (start: string, end: string): string =>
  `${fmtTime(start)} – ${fmtTime(end)}`;

export default function SurpriseBagScreen() {
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<AuthenticatedStackParamList, "SurpriseBag">>();
  const storeId = route.params?.storeId;

  const {
    cartItems,
    cartStoreId,
    totalQuantity,
    subtotal,
    addToCart,
    clearCart,
    updateStoreOffsets,
  } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data: inventory, isLoading: inventoryLoading } = useStoreInventory(
    storeId ?? 0,
  );
  const { data: stores } = useStores();
  const store = stores?.find((s: any) => s.id === storeId);

  const [modalVisible, setModalVisible] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedBag, setSelectedBag] = useState<any>(null);
  const [availabilitySheetVisible, setAvailabilitySheetVisible] =
    useState(false);
  const [selectedDate, setSelectedDate] = useState<"today" | "tomorrow">(
    "today",
  );
  const [pendingAdd, setPendingAdd] = useState<Omit<
    import("../../context/CartContext").CartItemProduct,
    "quantity"
  > | null>(null);

  const handleAddToCart = (
    item: Omit<import("../../context/CartContext").CartItemProduct, "quantity">,
  ) => {
    if (cartStoreId !== null && cartStoreId !== item.storeId) {
      setPendingAdd(item);
    } else {
      addToCart(item);
    }
  };

  const confirmNewCart = () => {
    if (pendingAdd) {
      clearCart();
      addToCart(pendingAdd);
      setPendingAdd(null);
    }
  };

  useEffect(() => {
    // Reset selected bag/date when store changes to prevent bleed
    setSelectedBag(null);
    if (inventory?.[0]) {
      setSelectedDate(
        pickupDayLabel(inventory[0].pickupStart) === "Today"
          ? "today"
          : "tomorrow",
      );
    } else {
      setSelectedDate("today");
    }
  }, [inventory, storeId]);

  useEffect(() => {
    if (route.params?.autoOpenSheet && totalQuantity === 0 && inventory?.[0]) {
      const bag = inventory[0];
      const timer = setTimeout(() => {
        handleAddToCart({
          id: String(bag.id),
          surpriseBoxId: bag.id,
          storeId: Number(storeId),
          title: bag.name,
          price: bag.price,
          originalPrice: bag.originalPrice ?? undefined,
          imageUrl: bag.imageUrl ?? undefined,
          pickupOffset: selectedDate === "tomorrow" ? 1 : 0,
        });
        setSheetVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [route.params?.autoOpenSheet, inventory]);

  const proceedFromCheckoutPress = () => {
    navigation.navigate("Cart" as never);
  };

  const handleCheckoutPress = async () => {
    try {
      const skipInfo = await AsyncStorage.getItem("skipMismishInfoModal");
      if (skipInfo === "true") {
        proceedFromCheckoutPress();
      } else {
        setModalVisible(true);
      }
    } catch {
      setModalVisible(true);
    }
  };

  const handleInfoModalContinue = async (dontShowAgain: boolean) => {
    setModalVisible(false);
    if (dontShowAgain) {
      await AsyncStorage.setItem("skipMismishInfoModal", "true");
    }
    setTimeout(() => proceedFromCheckoutPress(), 400);
  };

  const storeName = store?.name ?? "Store";
  const storeCategory = store?.category ?? "";
  const storeBannerImage = store?.name?.includes("Coffee Address")
    ? require("../../../assets/images/coffee_address_logo.png")
    : (store?.imageUrl ?? FALLBACK_IMAGE);
  const firstBag = inventory?.[0];

  if (inventoryLoading || !store) return <SurpriseBagSkeleton />;

  return (
    <InView className="bg-[#F9F9F9]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentInsetAdjustmentBehavior="never"
      >
        {/* Header Image */}
        <View className="relative w-full" style={{ height: width }}>
          <Image
            source={
              typeof storeBannerImage === "string"
                ? { uri: storeBannerImage }
                : storeBannerImage
            }
            className="w-full h-full"
            resizeMode="cover"
          />

          <View className="absolute bottom-0 w-full h-24">
            {[...Array(24)].map((_, i) => (
              <View
                key={i}
                className="w-full h-1"
                style={{
                  backgroundColor: `rgba(249, 249, 249, ${(i + 1) / 24})`,
                }}
              />
            ))}
          </View>

          <View className="absolute top-0 w-full flex-row justify-between pt-[54px] px-[20px]">
            <TouchableOpacity
              onPress={() => storeId != null && toggleFavorite(storeId)}
              className="w-10 h-10 rounded-full bg-black/40 items-center justify-center shadow-sm"
            >
              <Ionicons
                name={
                  storeId != null && isFavorite(storeId)
                    ? "heart"
                    : "heart-outline"
                }
                size={20}
                color={
                  storeId != null && isFavorite(storeId) ? "#FF7F50" : "#FFF"
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-black/40 items-center justify-center shadow-sm"
            >
              <Feather name="x" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {firstBag && (
            <View className="absolute bottom-6 right-5 items-end">
              {firstBag.originalPrice && (
                <View className="bg-[#FF7F50] rounded-full px-4 py-1.5 mb-2.5 shadow-sm">
                  <Text className="text-white font-black text-[15px]">
                    Save{" "}
                    {Math.round(
                      (1 - firstBag.price / firstBag.originalPrice) * 100,
                    )}
                    %
                  </Text>
                </View>
              )}
              <View className="bg-[#FF8A8A] rounded-full px-4 py-1 shadow-sm">
                <Text className="text-white font-bold text-[11px]">
                  Only {firstBag.quantity} bag
                  {firstBag.quantity !== 1 ? "s" : ""} left!
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Store Profile Card */}
        <View className="px-5 -mt-16 mb-4 z-10">
          <View className="bg-white rounded-2xl p-4 shadow-sm shadow-black/10 border border-gray-100">
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-row flex-1">
                <View className="w-14 h-14 bg-[#FAFAEE] rounded-xl items-center justify-center border border-[#EEEECC] mr-3 overflow-hidden">
                  <Image
                    source={
                      typeof storeBannerImage === "string"
                        ? { uri: storeBannerImage }
                        : storeBannerImage
                    }
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                <View className="flex-1 mt-0.5">
                  <Text className="text-[#111] font-black text-[18px] leading-tight mb-0.5">
                    {storeName}
                  </Text>
                  <Text className="text-gray-500 text-[11px] font-medium">
                    {storeCategory}
                    {store?.address ? ` • ${store.address}` : ""}
                  </Text>
                </View>
              </View>
              {store?.reviewCount > 0 && store?.rating != null && (
                <View className="flex-row items-center mt-1">
                  <Ionicons name="star" size={14} color="#FFB300" />
                  <Text className="text-[#111] font-black text-[13px] mx-1">
                    {store.rating.toFixed(1)}
                  </Text>
                  <Text className="text-gray-400 text-[11px]">
                    ({store.reviewCount})
                  </Text>
                </View>
              )}
            </View>

            <View className="border-t border-gray-100 pt-3 flex-row items-center">
              <View className="flex-1 items-center justify-center">
                <Text className="text-[#111] font-bold text-[13px] mb-1">
                  {store?.address?.split(",")[0] ?? "—"}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    const query = store?.address
                      ? encodeURIComponent(store.address)
                      : encodeURIComponent(storeName);
                    Linking.openURL(
                      `https://www.google.com/maps/dir/?api=1&destination=${query}`,
                    );
                  }}
                  className="flex-row items-center"
                >
                  <Text className="text-[#FF7F50] text-[11px] font-bold mr-1">
                    Get Directions
                  </Text>
                  <Feather
                    name="navigation"
                    size={10}
                    color="#FF7F50"
                    style={{ transform: [{ rotate: "45deg" }] }}
                  />
                </TouchableOpacity>
              </View>
              <View className="flex-1 items-center justify-center pl-4">
                <Text className="text-gray-500 text-[11px] font-medium mb-1">
                  Options
                </Text>
                <Text className="text-[#111] text-[11px] font-black tracking-tight text-center">
                  Self Pickup
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pickup Time */}
        {firstBag && (
          <View className="px-5 mb-5 flex-row items-center justify-between">
            <View>
              <Text className="text-[#111] font-black text-[16px] mb-1.5">
                Availability Time
              </Text>
              <View className="flex-row items-center">
                <Feather name="clock" size={16} color="#18C96D" />
                <Text className="text-[#366150] font-black text-[13px] ml-1 mr-0.5">
                  {selectedDate === "tomorrow" ? "Tomorrow" : "Today"}
                </Text>
                <Text className="text-[#366150] font-medium text-[13px]">
                  —{" "}
                  {formatPickupTime(
                    selectedBag?.pickupStart ?? firstBag?.pickupStart,
                    selectedBag?.pickupEnd ?? firstBag?.pickupEnd,
                  )}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setAvailabilitySheetVisible(true)}
              className="border border-[#FF7F50] rounded-full px-4 py-1.5 bg-white shadow-sm shadow-black/5"
            >
              <Text className="text-[#FF7F50] font-bold text-[11px]">
                Change
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="w-full h-2 bg-gray-50 mb-6" />

        {/* Inventory */}
        <View className="px-5 mb-2">
          {(inventory ?? []).length === 0 ? (
            <Text className="text-gray-400 text-center py-8">
              No bags available right now.
            </Text>
          ) : (
            (inventory ?? []).map((bag: any, index: number) => {
              const cartQty =
                cartItems.find((i) => i.id === String(bag.id))?.quantity ?? 0;
              return (
                <View key={bag.id}>
                  {index > 0 && <View className="h-4" />}
                  <StoreItemCard
                    title={bag.name}
                    description={bag.description ?? ""}
                    price={String(bag.price)}
                    originalPrice={String(bag.originalPrice ?? bag.price * 2)}
                    imageUrl={bag.imageUrl ?? FALLBACK_IMAGE}
                    leftCount={`${bag.quantity} left`}
                    quantity={cartQty}
                    maxQuantity={bag.quantity}
                    onAdd={() =>
                      handleAddToCart({
                        id: String(bag.id),
                        surpriseBoxId: bag.id,
                        storeId: Number(storeId),
                        title: bag.name,
                        price: bag.price,
                        originalPrice: bag.originalPrice ?? undefined,
                        imageUrl: bag.imageUrl ?? undefined,
                        pickupOffset: selectedDate === "tomorrow" ? 1 : 0,
                      })
                    }
                    onItemPress={() => {
                      setSelectedBag(bag);
                      setSheetVisible(true);
                    }}
                  />
                </View>
              );
            })
          )}
        </View>

        <View className="w-full h-2 bg-gray-50 mb-6" />

        <TouchableOpacity className="px-5 mb-6 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="storefront-outline"
              size={20}
              color="#111"
            />
            <Text className="text-[#111] font-black text-[15px] ml-3">
              Explore Other Branches
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="#111" />
        </TouchableOpacity>

        <View className="h-32" />
      </ScrollView>

      {/* Floating Checkout Footer */}
      <View className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-5 pt-3 pb-8 z-10">
        <TouchableOpacity
          onPress={handleCheckoutPress}
          className={`w-full rounded-2xl flex-row items-center px-4 h-[56px] shadow-sm ${
            totalQuantity > 0
              ? "bg-[#FF7F50] shadow-[#FF7F50]/20"
              : "bg-[#EAEAEA]"
          }`}
          disabled={totalQuantity === 0}
        >
          {totalQuantity > 0 && (
            <View className="w-6 h-6 bg-white rounded-full items-center justify-center mr-2">
              <Text className="text-[#FF7F50] font-black text-[12px]">
                {totalQuantity}
              </Text>
            </View>
          )}
          <Text
            className={`font-black text-[15px] flex-1 ${
              totalQuantity > 0 ? "text-white" : "text-gray-400 text-center"
            }`}
          >
            {totalQuantity > 0
              ? `SAR ${subtotal.toFixed(2)}`
              : "Go to checkout"}
          </Text>
          {totalQuantity > 0 && (
            <Text className="text-white font-black text-[15px]">
              Go to checkout
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <HowMismishWorksModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onContinue={handleInfoModalContinue}
      />
      <SurpriseBagBottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        item={selectedBag ?? firstBag}
        storeId={storeId}
        selectedDate={selectedDate}
      />
      <AvailabilityTimeBottomSheet
        visible={availabilitySheetVisible}
        onClose={() => setAvailabilitySheetVisible(false)}
        selectedDate={selectedDate}
        onSelectDate={(date) => {
          setSelectedDate(date);
          const newOffset = date === "tomorrow" ? 1 : 0;
          updateStoreOffsets(Number(storeId), newOffset);
        }}
        pickupStart={firstBag?.pickupStart ?? new Date().toISOString()}
        pickupEnd={firstBag?.pickupEnd ?? new Date().toISOString()}
      />

      {/* Cart-switch confirmation */}
      <Modal visible={!!pendingAdd} transparent animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setPendingAdd(null)}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: "#fff",
              borderRadius: 24,
              marginHorizontal: 28,
              padding: 28,
              width: "88%",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "900",
                color: "#111",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              Start a new cart?
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#666",
                textAlign: "center",
                lineHeight: 21,
                marginBottom: 24,
              }}
            >
              You already have items from a different store. Clear your cart and
              add from this one instead?
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setPendingAdd(null)}
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: "#FF7F50",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ color: "#FF7F50", fontWeight: "700", fontSize: 15 }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmNewCart}
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 14,
                  backgroundColor: "#FF7F50",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}
                >
                  Yes, Clear
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </InView>
  );
}
