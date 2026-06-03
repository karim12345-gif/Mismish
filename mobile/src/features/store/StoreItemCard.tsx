import React, { useRef, useState } from "react";
import { View, Text, Image, TouchableOpacity, Animated } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUserAllergies } from "../../context/AllergyContext";
import { hasAllergenWarning } from "../../utils/allergenUtils";
import { AllergenPopover, AllergenAnchor } from "../../components/AllergenPopover/AllergenPopover";

interface StoreItemCardProps {
  title: string;
  description: string;
  price: string;
  originalPrice: string;
  imageUrl: string;
  leftCount: string;
  quantity: number;
  maxQuantity: number;
  allergens?: string[];
  ingredients?: string[];
  onAdd: () => void;
  onItemPress: () => void;
}

export const StoreItemCard = ({
  title,
  description,
  price,
  originalPrice,
  imageUrl,
  leftCount,
  quantity,
  maxQuantity,
  allergens = [],
  ingredients = [],
  onAdd,
  onItemPress,
}: StoreItemCardProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const alertsBtnRef = useRef<View>(null);
  const isSoldOut = quantity >= maxQuantity;
  const { userAllergies } = useUserAllergies();

  const [popoverVisible, setPopoverVisible] = useState(false);
  const [anchor, setAnchor] = useState<AllergenAnchor | null>(null);

  const hasWarning = hasAllergenWarning(allergens, userAllergies);

  const openPopover = () => {
    alertsBtnRef.current?.measureInWindow((x, y, w, h) => {
      setAnchor({ x, y, width: w, height: h });
      setPopoverVisible(true);
    });
  };

  const handleAdd = () => {
    if (isSoldOut) return;
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.35, useNativeDriver: true, speed: 50, bounciness: 10 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }),
    ]).start();
    onAdd();
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onItemPress}
        className="flex-row items-stretch justify-between mb-6"
      >
        {/* Left Details */}
        <View className="flex-1 pr-4">
          <Text className="text-[#111] font-black text-[16px] mb-1.5" numberOfLines={1}>
            {title}
          </Text>

          <Text
            className="text-gray-500 font-medium text-[12px] leading-5 mb-3"
            numberOfLines={3}
          >
            {description}
          </Text>

          {/* Price row + Alerts trigger */}
          <View className="flex-row items-center">
            <Text className="text-[#FF7F50] font-black text-[14px] mr-2">
              SR {price}
            </Text>
            <Text className="text-[#AAA] font-bold text-[11px] line-through mr-3">
              SR {originalPrice}
            </Text>

            {/* ⓘ Alerts / ⚠️ Alerts trigger — only if bag has allergens */}
            {allergens.length > 0 && (
              <View ref={alertsBtnRef} collapsable={false}>
                <TouchableOpacity
                  onPress={(e) => { e.stopPropagation(); openPopover(); }}
                  activeOpacity={0.6}
                  style={{ flexDirection: "row", alignItems: "center" }}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                >
                  <MaterialCommunityIcons
                    name={hasWarning ? "alert-circle-outline" : "information-outline"}
                    size={13}
                    color={hasWarning ? "#C0392B" : "#AAAAAA"}
                  />
                  <Text style={{
                    fontSize: 12,
                    fontWeight: hasWarning ? "600" : "400",
                    color: hasWarning ? "#C0392B" : "#AAAAAA",
                    marginLeft: 3,
                  }}>
                    Alerts
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Right Image & Action */}
        <View className="w-[100px] h-[100px] relative">
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full rounded-2xl bg-gray-100"
            resizeMode="cover"
            style={{ opacity: isSoldOut ? 0.45 : 1 }}
          />

          {!isSoldOut && (
            <View className="absolute top-2 left-2 bg-[#FFF2C2] px-2 py-0.5 rounded-md">
              <Text className="text-[#D7402B] text-[9px] font-black">{leftCount}</Text>
            </View>
          )}

          {isSoldOut && (
            <View className="absolute inset-0 items-center justify-center rounded-2xl">
              <View className="bg-black/60 px-2.5 py-1 rounded-lg">
                <Text className="text-white text-[10px] font-black tracking-wide">SOLD OUT</Text>
              </View>
            </View>
          )}

          {quantity > 0 && !isSoldOut && (
            <View
              className="absolute top-2 right-2 w-5 h-5 rounded-full items-center justify-center"
              style={{ backgroundColor: "#FF7F50" }}
            >
              <Text className="text-white font-black text-[10px]">{quantity}</Text>
            </View>
          )}

          {!isSoldOut && (
            <Animated.View
              style={{ transform: [{ scale }], position: "absolute", bottom: -8, right: -4 }}
            >
              <TouchableOpacity
                onPress={handleAdd}
                activeOpacity={0.8}
                className="w-8 h-8 rounded-full bg-[#FF7F50] items-center justify-center shadow-sm shadow-black/10 border-2 border-white"
              >
                <Feather name="plus" size={16} color="#FFF" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>

      <AllergenPopover
        visible={popoverVisible}
        onClose={() => setPopoverVisible(false)}
        anchor={anchor}
        allergens={allergens}
        ingredients={ingredients}
      />
    </>
  );
};
