import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUserAllergies } from "../../context/AllergyContext";
import { hasAllergenWarning } from "../../utils/allergenUtils";
import {
  AllergenPopover,
  AllergenAnchor,
} from "../../components/AllergenPopover/AllergenPopover";
import { useCart } from "../../context/CartContext";
import { DEFAULT_LISTING_IMAGE } from "../../constants/images";

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
  onAddToCart?: (
    item: Omit<
      import("../../context/CartContext").CartItemProduct,
      "quantity"
    >,
  ) => void;
}

export const SurpriseBagBottomSheet = ({
  visible,
  onClose,
  item,
  storeId,
  selectedDate = "today",
  onAddToCart,
}: SurpriseBagBottomSheetProps) => {
  const { addToCart, cartItems, incrementItem, decrementItem } = useCart();
  const { userAllergies } = useUserAllergies();
  const alertsBtnRef = useRef<View>(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [anchor, setAnchor] = useState<AllergenAnchor | null>(null);

  const allergens: string[] = item?.allergens ?? [];
  const hasAllergenSection = allergens.length > 0;

  const openPopover = () => {
    alertsBtnRef.current?.measureInWindow((x, y, w, h) => {
      setAnchor({ x, y, width: w, height: h });
      setPopoverVisible(true);
    });
  };

  const bagImg = item?.imageUrl ?? DEFAULT_LISTING_IMAGE;
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

      const cartItem = {
        id: String(item.id),
        surpriseBoxId: item.id,
        storeId: storeId,
        title: item.name,
        price: item.price,
        originalPrice: item.originalPrice ?? undefined,
        imageUrl: item.imageUrl ?? DEFAULT_LISTING_IMAGE,
        maxQuantity: item.quantity,
        pickupOffset: offset,
        pickupEnd: item.pickupEnd ?? undefined,
      };

      if (onAddToCart) {
        onAddToCart(cartItem);
      } else {
        addToCart(cartItem);
      }
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

              {/* Price row + ⓘ Alerts trigger — identical to listing card */}
              <View className="flex-row items-center mb-6">
                <Text className="text-[#FF7F50] font-black text-[18px] mr-2">
                  SR {bagPrice}
                </Text>
                <Text className="text-[#AAA] font-bold text-[12px] line-through mr-3">
                  SR {bagOriginal}
                </Text>

                {hasAllergenSection && (
                  <View ref={alertsBtnRef} collapsable={false}>
                    <TouchableOpacity
                      activeOpacity={0.6}
                      onPress={openPopover}
                      style={{ flexDirection: "row", alignItems: "center" }}
                      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                    >
                      <MaterialCommunityIcons
                        name={
                          hasAllergenWarning(allergens, userAllergies)
                            ? "alert-circle-outline"
                            : "information-outline"
                        }
                        size={14}
                        color={
                          hasAllergenWarning(allergens, userAllergies)
                            ? "#C0392B"
                            : "#AAAAAA"
                        }
                      />
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: hasAllergenWarning(
                            allergens,
                            userAllergies,
                          )
                            ? "600"
                            : "400",
                          color: hasAllergenWarning(allergens, userAllergies)
                            ? "#C0392B"
                            : "#AAAAAA",
                          marginLeft: 4,
                        }}
                      >
                        Alerts
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Sticky Footer */}
          <View className="absolute bottom-0 w-full bg-white border-t border-gray-100 shadow-md shadow-black/10 px-5 pt-4 pb-8 flex-row items-center justify-between z-10">
            {cartQty > 0 ? (
              <View className="flex-row items-center bg-[#F9F9F9] rounded-xl py-3 px-3 border border-gray-200 mr-4 flex-1 justify-between">
                <TouchableOpacity
                  onPress={() => decrementItem(String(item.id))}
                >
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
      <AllergenPopover
        visible={popoverVisible}
        onClose={() => setPopoverVisible(false)}
        anchor={anchor}
        allergens={allergens}
        ingredients={item?.ingredients ?? []}
      />
    </Modal>
  );
};
