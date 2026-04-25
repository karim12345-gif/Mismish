import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export const CheckoutFulfillmentToggle = () => {
  const [method, setMethod] = useState<"pickup" | "delivery">("pickup");

  return (
    <View className="px-5 pt-4 pb-6">
      <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl p-1 shadow-sm shadow-black/5">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setMethod("pickup")}
          className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
            method === "pickup" ? "bg-[#FF7F50]" : "bg-transparent"
          }`}
        >
          <MaterialCommunityIcons
            name="walk"
            size={18}
            color={method === "pickup" ? "#FFF" : "#777"}
          />
          <Text
            className={`ml-2 font-bold text-[14px] ${
              method === "pickup" ? "text-white" : "text-gray-500"
            }`}
          >
            Self Pickup
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setMethod("delivery")}
          className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
            method === "delivery" ? "bg-[#FF7F50]" : "bg-transparent"
          }`}
        >
          <MaterialCommunityIcons
            name="bike"
            size={18}
            color={method === "delivery" ? "#FFF" : "#777"}
          />
          <Text
            className={`ml-2 font-bold text-[14px] ${
              method === "delivery" ? "text-white" : "text-gray-500"
            }`}
          >
            Delivery
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
