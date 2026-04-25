import React from "react";
import { View, Text } from "react-native";

export const CheckoutRewardsBanner = () => {
  return (
    <View className="bg-white px-5 py-5 border-t-[8px] border-gray-50">
      <Text className="text-[#111] font-black text-[15px] mb-3">
        Mismish Rewards 🎁
      </Text>

      <View className="bg-[#FFF4E5] rounded-xl flex-row items-center px-4 py-4">
        {/* Simplified Flower/Heart Icon */}
        <Text className="text-[20px] mr-3">🌷</Text>
        <Text className="text-[#3A141A] font-black text-[13px] flex-1 tracking-tight">
          This order completes the 1st milestone
        </Text>
        <View className="bg-[#00C853] w-4 h-4 rounded-sm items-center justify-center">
          <Text className="text-white font-black text-[10px]">✓</Text>
        </View>
      </View>
    </View>
  );
};
