import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocation } from "../../../context/LocationContext";
import { useNavigation } from "@react-navigation/native";

export const HomeHeader = () => {
  const { address, isRequestingLocation } = useLocation();
  const navigation = useNavigation<any>();

  const primaryText =
    address?.name ||
    address?.district ||
    address?.street ||
    (isRequestingLocation ? "Discovering..." : "Riyadh");

  const secondaryText = address
    ? `${address.streetNumber || ""} ${address.street || ""} ${address.city || ""}`.trim()
    : isRequestingLocation
      ? "Fetching location..."
      : "Tap to set location";

  return (
    <View className="flex-row justify-between items-center w-full bg-white px-5 pt-8 pb-4">
      {/* Left side: Location Info */}
      <TouchableOpacity
        className="flex-row items-center flex-1 pr-6"
        activeOpacity={0.7}
        onPress={() => navigation.navigate("Map", { flyToLocation: true })}
      >
        {/* House Icon */}
        <View className="mr-3">
          <Feather name="home" size={24} color="#111" />
        </View>
        <View className="justify-center flex-1">
          <View className="flex-row items-center">
            {isRequestingLocation && (
              <ActivityIndicator
                size="small"
                color="#366150"
                className="mr-2"
              />
            )}
            <Text
              className="font-extrabold text-[#111] text-[15px] leading-tight flex-shrink"
              numberOfLines={1}
            >
              {primaryText}
            </Text>
            <Feather
              name="chevron-down"
              size={16}
              color="#333"
              className="ml-1"
            />
          </View>
          <Text
            className="text-[#888] text-[11px] font-semibold mt-0.5"
            numberOfLines={1}
          >
            {secondaryText}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Right side: Wallet & Fav */}
      <View className="flex-row items-center">
        <TouchableOpacity
          className="flex-row items-center justify-center"
          onPress={() => navigation.navigate("Wallet")}
        >
          <Text className="font-black text-[#111] text-[13px] mr-1 opacity-80 mt-0.5">
            ﷼
          </Text>
          <Text className="font-extrabold text-[#111] text-[16px] mr-1.5">
            0
          </Text>
          <Ionicons name="wallet-outline" size={22} color="#111" />
        </TouchableOpacity>

        <View className="w-[1px] h-[18px] bg-gray-300 mx-3" />

        <TouchableOpacity onPress={() => navigation.navigate("Favorites")}>
          <Feather name="heart" size={20} color="#111" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
