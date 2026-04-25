import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

interface StoreItemCardProps {
  title: string;
  description: string;
  price: string;
  originalPrice: string;
  imageUrl: string;
  leftCount: string;
  quantity: number;
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
  onAdd,
  onItemPress,
}: StoreItemCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onItemPress}
      className="flex-row items-stretch justify-between mb-6"
    >
      {/* Left Details */}
      <View className="flex-1 pr-4">
        <Text className="text-[#111] font-black text-[16px] mb-1.5">
          {title}
        </Text>
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
        />

        {/* Badge */}
        <View className="absolute top-2 left-2 bg-[#FFF2C2] px-2 py-0.5 rounded-md">
          <Text className="text-[#D7402B] text-[9px] font-black">
            {leftCount}
          </Text>
        </View>

        {/* Plus / Quantity Button */}
        <TouchableOpacity
          onPress={onAdd}
          activeOpacity={0.8}
          className="absolute -bottom-2 -right-1 w-8 h-8 rounded-full items-center justify-center shadow-sm shadow-black/10 border border-white"
          style={{ backgroundColor: quantity > 0 ? "#FF7F50" : "#FF7F50" }}
        >
          {quantity > 0 ? (
            <Text className="text-white font-black text-[14px]">
              {quantity}
            </Text>
          ) : (
            <Feather name="plus" size={16} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
