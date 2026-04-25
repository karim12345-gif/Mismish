import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface CheckoutPaymentFooterProps {
  onPayPress: () => void;
}

export const CheckoutPaymentFooter = ({
  onPayPress,
}: CheckoutPaymentFooterProps) => {
  return (
    <View className="absolute bottom-0 w-full">
      {/* Green Savings Ribbon */}
      <View className="bg-[#18C96D] w-full py-2 px-5 flex-row items-center">
        <Text className="text-white text-[16px] mr-2">🪄</Text>
        <Text className="text-white font-black text-[13px]">
          You'll save <Text className="underline">﷼ 87.00</Text> on this order
        </Text>
      </View>

      {/* Deep Apple Pay Dock */}
      <View className="bg-white pt-4 pb-10 px-5 shadow-[0_-15px_30px_rgba(0,0,0,0.05)]">
        <TouchableOpacity
          onPress={onPayPress}
          className="bg-black w-full h-14 rounded-2xl items-center justify-center flex-row"
        >
          <FontAwesome
            name="apple"
            size={20}
            color="white"
            className="mt-0.5"
          />
          <Text className="text-white font-black text-[20px] ml-1 tracking-tight">
            Pay
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
