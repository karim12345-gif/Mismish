import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AIAssistantBottomSheet } from "../../../components/AIAssistantBottomSheet";

export const CheckoutHeader = () => {
  const navigation = useNavigation();
  const [timeLeft, setTimeLeft] = useState(592); // 09:52
  const [aiVisible, setAiVisible] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <View className="bg-white pt-4 pb-3 border-b border-gray-100">
      <View className="flex-row items-center justify-between px-5 mb-3">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-8 h-8 items-center justify-center -ml-2"
        >
          <Feather name="chevron-left" size={24} color="#111" />
        </TouchableOpacity>

        <Text className="text-[#111] font-black text-[16px]">
          Your order details
        </Text>

        <TouchableOpacity
          className="flex-row items-center -mr-1"
          onPress={() => setAiVisible(true)}
        >
          <Text className="text-[#111] font-bold text-[13px] mr-1.5">Help</Text>
          <Feather name="headphones" size={18} color="#111" />
        </TouchableOpacity>
      </View>

      <Text className="text-center text-[#D32F2F] font-bold text-[13px]">
        Your bag will be held for {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </Text>

      <AIAssistantBottomSheet
        visible={aiVisible}
        onClose={() => setAiVisible(false)}
      />
    </View>
  );
};
