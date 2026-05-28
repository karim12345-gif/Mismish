import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { useCart } from "../../context/CartContext";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800";

const fmtTime = (iso: string, offset = 0) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + offset);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatTimeRange = (start: string, end: string, offset = 0) => {
  const s = new Date(start);
  const e = new Date(end);
  const sTime = s.getTime();
  const eTime = e.getTime();

  if (sTime > eTime) {
    return `${fmtTime(end, offset)} – ${fmtTime(start, offset)}`;
  }
  return `${fmtTime(start, offset)} – ${fmtTime(end, offset)}`;
};

interface SurpriseBagBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  item?: any;
  storeId?: number;
  selectedDate?: "today" | "tomorrow";
}

export const SurpriseBagBottomSheet = ({
  visible,
  onClose,
  item,
  storeId,
  selectedDate = "today",
}: SurpriseBagBottomSheetProps) => {
  const [showAllergies, setShowAllergies] = React.useState(false);
  const { addToCart, cartItems, incrementItem, decrementItem } = useCart();

  const bagImg = item?.imageUrl ?? FALLBACK_IMAGE;
  const bagPrice = (item?.price ?? 0).toFixed(2);
  const bagOriginal = (item?.originalPrice ?? (item?.price ?? 0) * 2).toFixed(
    2,
  );
  const cartQty = item
    ? (cartItems.find((i) => i.id === String(item.id))?.quantity ?? 0)
    : 0;
  const atMaxQty = cartQty >= (item?.quantity ?? 0);

  const handleAddToCart = () => {
    if (item) {
      const offset = selectedDate === "tomorrow" ? 1 : 0;
      const formattedTime = formatTimeRange(
        item.pickupStart,
        item.pickupEnd,
        offset,
      );
      const dayStr = selectedDate === "tomorrow" ? "Tomorrow" : "Today";

      addToCart({
        id: String(item.id),
        surpriseBoxId: item.id,
        storeId: storeId,
        title: item.name,
        price: item.price,
        originalPrice: item.originalPrice ?? undefined,
        imageUrl: item.imageUrl ?? undefined,
        maxQuantity: item.quantity,
        pickupOffset: offset,
        pickupEnd: item.pickupEnd ?? undefined,
      });
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View className="flex-1 justify-end">
        {/* Dark Background Overlay */}
        <View className="absolute inset-0 bg-black/40">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={onClose}
          />
        </View>

        {/* Bottom Sheet Modal Container */}
        <View className="bg-white rounded-t-3xl overflow-hidden h-[85%] mt-10 shadow-lg">
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* Top Image Banner */}
            <View className="w-full h-56 bg-gray-100 relative">
              <Image
                source={typeof bagImg === "string" ? { uri: bagImg } : bagImg}
                className="w-full h-full"
                resizeMode="cover"
              />
              {/* Close Button X */}
              <TouchableOpacity
                onPress={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full items-center justify-center bg-black/40"
              >
                <Feather name="x" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Content Body */}
            <View className="px-5 pt-6 pb-4">
              {/* Badge */}
              <View className="bg-[#FFF2C2] px-2.5 py-1 rounded-md self-start mb-3">
                <Text className="text-[#D7402B] text-[10px] font-black">
                  {item?.quantity ?? 0} Left
                </Text>
              </View>

              {/* Title */}
              <Text className="text-[#111] font-black text-xl mb-3">
                {item?.name ?? "Surprise Bag"}
              </Text>

              {/* Description */}
              <Text className="text-gray-500 font-medium text-[13px] leading-5 mb-5">
                {item?.description ??
                  "A delightful assortment of freshly baked pastries or desserts."}
              </Text>

              {/* Price */}
              <View className="flex-row items-end mb-6">
                <Text className="text-[#FF7F50] font-black text-[18px] mr-2">
                  SR {bagPrice}
                </Text>
                <Text className="text-[#AAA] font-bold text-[12px] line-through decoration-[#AAA] mb-1">
                  SR {bagOriginal}
                </Text>
              </View>

              {/* Divider */}
              <View className="h-[1px] w-full bg-gray-100 mb-5" />

              {/* Ingredients & Allergies Accordion */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowAllergies(!showAllergies)}
                className={`flex-row items-center justify-between ${showAllergies ? "mb-2" : "mb-4"}`}
              >
                <Text className="text-[#111] font-bold text-[15px]">
                  Ingredients & Allergies
                </Text>
                <Feather
                  name={showAllergies ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#111"
                />
              </TouchableOpacity>

              {showAllergies && (
                <View className="mb-6">
                  <Text className="text-[#444] font-medium text-[12px] leading-5">
                    Bag may contain allergens. Please call restaurant for
                    details.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Sticky Footer */}
          <View className="absolute bottom-0 w-full bg-white border-t border-gray-100 shadow-md shadow-black/10 px-5 pt-4 pb-8 flex-row items-center justify-between z-10">
            {cartQty > 0 ? (
              <View className="flex-row items-center bg-[#F9F9F9] rounded-xl py-3 px-3 border border-gray-200 mr-4 flex-1 justify-between">
                <TouchableOpacity onPress={() => decrementItem(String(item.id))}>
                  <Feather name="minus" size={18} color="#FF7F50" />
                </TouchableOpacity>
                <Text className="text-center font-black text-[15px] text-[#111]">
                  {cartQty}
                </Text>
                {/* Disable "+" when all available stock is already in cart */}
                <TouchableOpacity
                  onPress={() => !atMaxQty && incrementItem(String(item.id))}
                  disabled={atMaxQty}
                >
                  <Feather
                    name="plus"
                    size={18}
                    color={atMaxQty ? "#CCC" : "#FF7F50"}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleAddToCart}
                className="flex-1 bg-[#FF7F50] rounded-xl flex-row items-center justify-between px-5 h-[48px]"
              >
                <Text className="text-white font-bold text-[15px]">
                  Add to Cart
                </Text>
                <Text className="text-white font-bold text-[15px]">
                  SR {bagPrice}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
