import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

export const CheckoutOrderItems = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="bg-white px-5 py-5 border-t-[8px] border-gray-50">
      <Text className="text-[#111] font-black text-[15px] mb-1.5">
        Order Details
      </Text>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between py-2"
      >
        <Text className="text-[#111] font-medium text-[14px]">Items (1)</Text>
        <View className="flex-row items-center">
          <Text className="text-gray-500 font-medium text-[13px] mr-1">
            View
          </Text>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#888"
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View className="mt-3 bg-gray-50 rounded-xl p-4">
          <View className="flex-row items-start justify-between">
            <Text className="text-[#111] font-bold text-[14px] flex-1 mr-4">
              1x Standard Celebration Bag
            </Text>
            <Text className="text-[#111] font-black text-[14px]">﷼ 87.00</Text>
          </View>
        </View>
      )}
    </View>
  );
};
