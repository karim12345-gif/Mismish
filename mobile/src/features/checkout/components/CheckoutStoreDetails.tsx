import React from "react";
import { View, Text, Image } from "react-native";
import { Feather } from "@expo/vector-icons";

export const CheckoutStoreDetails = () => {
  return (
    <View className="bg-white px-5 pt-4 pb-6 border-t-[8px] border-gray-50">
      {/* Store Block */}
      <View className="mb-6">
        <Text className="text-[#111] font-black text-[15px] mb-3">
          Store Details
        </Text>
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-xl border border-gray-100 items-center justify-center mr-3 bg-white shadow-sm shadow-black/5">
            {/* Dummy brand logo spacing */}
            <Text className="font-bold text-[18px]">🎂</Text>
          </View>
          <View className="flex-1">
            <Text
              className="text-[#111] font-bold text-[14px] mb-0.5"
              numberOfLines={1}
            >
              Aani And Dani - Al Sahafah
            </Text>
            <View className="flex-row items-center">
              <Feather
                name="map-pin"
                size={10}
                color="#FF7F50"
                className="mr-1"
              />
              <Text className="text-gray-500 font-medium text-[12px] ml-1">
                (3.6 km)
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View className="h-[1px] bg-gray-100 mb-6" />

      {/* Pickup Time Block */}
      <View>
        <Text className="text-[#111] font-black text-[15px] mb-2">
          Pickup Time :
        </Text>
        <View className="flex-row items-center">
          <Feather name="clock" size={14} color="#888" />
          <Text className="text-gray-500 font-medium text-[13px] ml-1.5">
            <Text className="text-[#111] font-black">Later Today</Text> -
            Monday, 10:30 PM - 11:30 PM
          </Text>
        </View>
      </View>
    </View>
  );
};
