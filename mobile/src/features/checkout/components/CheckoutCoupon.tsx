import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

export const CheckoutCoupon = () => {
  const [couponCode, setCouponCode] = useState("");

  return (
    <View className="bg-white px-5 py-5 border-t-[8px] border-gray-50">
      <Text className="text-[#111] font-black text-[15px] mb-3">Coupons</Text>

      <View className="flex-row items-center">
        <View className="flex-1 border border-gray-200 rounded-xl h-14 mr-3 bg-white justify-center px-4">
          <TextInput
            placeholder="Enter Coupon Code"
            placeholderTextColor="#A1A1A1"
            className="font-medium text-[15px] text-[#111]"
            value={couponCode}
            onChangeText={setCouponCode}
          />
        </View>
        <TouchableOpacity
          disabled={!couponCode.trim()}
          className={`h-14 px-6 rounded-xl items-center justify-center ${
            couponCode.trim() ? "bg-[#111]" : "bg-[#E5E5E5]"
          }`}
        >
          <Text
            className={`font-bold text-[14px] ${
              couponCode.trim() ? "text-white" : "text-gray-400"
            }`}
          >
            Apply
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
