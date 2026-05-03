import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Props {
  method: "pickup" | "delivery";
  onChange: (m: "pickup" | "delivery") => void;
}

export const CheckoutFulfillmentToggle = ({ method, onChange }: Props) => {
  return (
    <View className="px-5 pt-4 pb-2">
      <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl p-1 shadow-sm shadow-black/5">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onChange("pickup")}
          className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
            method === "pickup" ? "bg-[#FF7F50]" : "bg-transparent"
          }`}
        >
          <MaterialCommunityIcons
            name="walk"
            size={18}
            color={method === "pickup" ? "#FFF" : "#777"}
          />
          <Text className={`ml-2 font-bold text-[14px] ${method === "pickup" ? "text-white" : "text-gray-500"}`}>
            Self Pickup
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onChange("delivery")}
          className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
            method === "delivery" ? "bg-[#FF7F50]" : "bg-transparent"
          }`}
        >
          <MaterialCommunityIcons
            name="bike"
            size={18}
            color={method === "delivery" ? "#FFF" : "#777"}
          />
          <Text className={`ml-2 font-bold text-[14px] ${method === "delivery" ? "text-white" : "text-gray-500"}`}>
            Delivery
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
