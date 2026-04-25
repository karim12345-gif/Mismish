import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export const HomeQuickActions = () => {
  return (
    <View className="flex-row px-5 justify-between gap-x-3 mt-4 mb-2">
      {/* Map View Card */}
      <TouchableOpacity
        className="flex-1 bg-white rounded-3xl p-4 flex-row items-center border border-gray-100 shadow-sm shadow-black/5"
        style={{
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        <View className="w-12 h-12 rounded-2xl bg-[#FFE4E8] items-center justify-center mr-3">
          <MaterialCommunityIcons name="map-marker" size={24} color="#FF2C55" />
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-extrabold text-[#222] mb-0.5">
            Map View
          </Text>
          <Text className="text-[#777] text-[12px] font-semibold">
            Find nearby deals
          </Text>
        </View>
      </TouchableOpacity>

      {/* Rewards Card */}
      <TouchableOpacity
        className="flex-1 bg-white rounded-3xl p-4 flex-row items-center border border-gray-100 shadow-sm shadow-black/5"
        style={{
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        <View className="w-12 h-12 rounded-2xl bg-[#FFE9DB] items-center justify-center mr-3">
          <Feather name="gift" size={22} color="#FF7F50" />
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-extrabold text-[#222] mb-0.5">
            Rewards
          </Text>
          <Text className="text-[#777] text-[12px] font-semibold">
            240 points
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};
