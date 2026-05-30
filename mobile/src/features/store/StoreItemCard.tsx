import React, { useRef } from "react";
import { View, Text, Image, TouchableOpacity, Animated, Alert } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUserAllergies } from "../../context/AllergyContext";
import { ALL_ALLERGENS } from "../../constants/allergens";

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
  onAdd,
  onItemPress,
}: StoreItemCardProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const isSoldOut = quantity >= maxQuantity;
  const { userAllergies } = useUserAllergies();

  const matchedAllergens = allergens.filter((a) => userAllergies.includes(a));
  const hasWarning = matchedAllergens.length > 0;

  const showAllergenInfo = () => {
    if (allergens.length === 0) return;
    const list = allergens
      .map((id) => {
        const found = ALL_ALLERGENS.find((a) => a.id === id);
        return found ? `${found.emoji} ${found.label}` : id;
      })
      .join("\n");
    Alert.alert("Contains allergens", list, [{ text: "Got it" }]);
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
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onItemPress}
      className="flex-row items-stretch justify-between mb-6"
    >
      {/* Left Details */}
      <View className="flex-1 pr-4">
        {/* Title + allergen icon */}
        <View className="flex-row items-center mb-1.5">
          <Text className="text-[#111] font-black text-[16px] flex-1" numberOfLines={1}>
            {title}
          </Text>
          {allergens.length > 0 && (
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation(); showAllergenInfo(); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="ml-2"
            >
              <MaterialCommunityIcons
                name={hasWarning ? "alert-circle" : "information-outline"}
                size={18}
                color={hasWarning ? "#DC2626" : "#bbb"}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Warning badge */}
        {hasWarning && (
          <View className="flex-row items-center bg-red-50 border border-red-200 self-start px-2 py-0.5 rounded-full mb-2">
            <MaterialCommunityIcons name="alert" size={10} color="#DC2626" />
            <Text className="text-red-600 text-[10px] font-bold ml-1">
              Contains {matchedAllergens.slice(0, 2).join(", ")}
              {matchedAllergens.length > 2 ? ` +${matchedAllergens.length - 2}` : ""}
            </Text>
          </View>
        )}

        <Text
          className="text-gray-500 font-medium text-[12px] leading-5 mb-3"
          numberOfLines={3}
        >
          {description}
        </Text>
        <View className="flex-row items-end">
          <Text className="text-[#FF7F50] font-black text-[14px] mr-2">
            SR {price}
          </Text>
          <Text className="text-[#AAA] font-bold text-[11px] line-through decoration-[#AAA] mb-0.5">
            SR {originalPrice}
          </Text>
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
  );
};
