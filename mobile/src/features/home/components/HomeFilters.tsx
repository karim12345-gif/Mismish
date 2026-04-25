import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export const HomeFilters = () => {
  return (
    <View className="flex-row">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          gap: 10,
          paddingBottom: 10,
        }}
      >
        <TouchableOpacity className="flex-row items-center border border-gray-200 rounded-full px-3 py-1.5 bg-white shadow-sm shadow-black/5">
          <MaterialCommunityIcons
            name="sort-variant"
            size={16}
            color="#444"
            style={{ marginRight: 6 }}
          />
          <Text className="text-[#222] text-[13px] font-bold mr-1">
            Sort By
          </Text>
          <Feather name="chevron-down" size={14} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center border border-gray-200 rounded-full px-3 py-1.5 bg-white shadow-sm shadow-black/5">
          <MaterialCommunityIcons
            name="silverware-fork-knife"
            size={14}
            color="#555"
            style={{ marginRight: 6 }}
          />
          <Text className="text-[#222] text-[13px] font-bold mr-1">
            Cuisine
          </Text>
          <Feather name="chevron-down" size={14} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center border border-gray-200 rounded-full px-3 py-1.5 bg-white shadow-sm shadow-black/5">
          <Feather
            name="dollar-sign"
            size={14}
            color="#555"
            style={{ marginRight: 2 }}
          />
          <Text className="text-[#222] text-[13px] font-bold mr-1">Price</Text>
          <Feather name="chevron-down" size={14} color="#666" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
