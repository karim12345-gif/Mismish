import React from "react";
import { View, Text, Image, TouchableOpacity, Pressable } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface SurpriseBagCardProps {
  storeId: number;
  title: string;
  price: string;
  originalPrice: string;
  timeRange: string;
  distance: string;
  imageUrl: string;
  logoUrl: string;
  leftCount: string;
}

export const SurpriseBagCard = ({
  storeId,
  title,
  price,
  originalPrice,
  timeRange,
  distance,
  imageUrl,
  logoUrl,
  leftCount,
}: SurpriseBagCardProps) => {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("SurpriseBag", { storeId })}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 mb-5"
      style={{
        width: 260,
      }}
    >
      {/* Top Image Area */}
      <View className="relative h-[120px] w-full bg-gray-100">
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Left Count Badge */}
        <View className="absolute top-2 left-2 bg-[#FFF2C2] px-2 py-0.5 rounded-md">
          <Text className="text-[#D7402B] text-[10px] font-black">
            {leftCount}
          </Text>
        </View>

        {/* Plus Button Right */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            navigation.navigate("SurpriseBag", { storeId, autoOpenSheet: true });
          }}
          className="absolute -bottom-4 right-3 w-8 h-8 bg-white rounded-full items-center justify-center border border-gray-200 z-10"
        >
          <Feather name="plus" size={16} color="#FF7F50" />
        </Pressable>

        {/* Square Logo Overlap */}
        <View className="absolute -bottom-4 left-3 w-10 h-10 bg-white rounded-lg items-center justify-center border border-gray-200 overflow-hidden z-10">
          <Image
            source={{ uri: logoUrl }}
            className="w-[80%] h-[80%] rounded-md"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Bottom Content Area */}
      <View className="pt-6 px-3 pb-4">
        <Text
          className="text-[#111] font-extrabold text-[12px] mb-1.5"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {title}
        </Text>

        {/* Price Row */}
        <View className="flex-row items-end mb-3">
          <Text
            className="text-[#FF2C55] font-black text-[14px] leading-tight mr-1.5"
            adjustsFontSizeToFit
          >
            {price}
          </Text>
          <Text className="text-[#AAA] text-[10px] font-bold line-through decoration-[#AAA] mb-[2px]">
            {originalPrice}
          </Text>
        </View>

        {/* Info Rows in Flex Row */}
        <View className="flex-row items-center justify-between border-t border-gray-50 pt-2 opacity-70">
          <View className="flex-row items-center flex-1 mr-1.5">
            <MaterialCommunityIcons
              name="clock-outline"
              size={12}
              color="#18C96D"
            />
            <Text
              className="text-gray-600 text-[10px] font-bold ml-1"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {timeRange}
            </Text>
          </View>
          <View className="flex-row items-center flex-shrink-0">
            <Feather name="map-pin" size={10} color="#888" />
            <Text className="text-gray-600 text-[10px] font-bold ml-1">
              {distance}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
