import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useCart } from "../../../context/CartContext";

export const CheckoutOrderItems = () => {
  const [expanded, setExpanded] = useState(true);
  const { cartItems, incrementItem, decrementItem } = useCart();

  const totalCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <View className="bg-white px-5 py-5 border-t-[8px] border-gray-50">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between mb-1.5"
      >
        <Text className="text-[#111] font-black text-[15px]">
          Order Details
        </Text>
        <View className="flex-row items-center">
          <Text className="text-gray-500 font-medium text-[13px] mr-1">
            {totalCount} item{totalCount !== 1 ? "s" : ""}
          </Text>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#888"
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View className="mt-3 gap-3">
          {cartItems.map((item) => (
            <View
              key={item.id}
              className="bg-gray-50 rounded-xl px-4 py-3.5 flex-row items-center"
            >
              <View className="flex-1 mr-3">
                <Text className="text-[#111] font-bold text-[14px]" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text className="text-gray-500 font-medium text-[13px] mt-0.5">
                  SAR {item.price.toFixed(2)} each
                </Text>
              </View>

              {/* Quantity stepper */}
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={() => decrementItem(item.id)}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 items-center justify-center shadow-sm shadow-black/5"
                >
                  <Feather name="minus" size={14} color="#111" />
                </TouchableOpacity>
                <Text className="text-[#111] font-black text-[15px] w-5 text-center">
                  {item.quantity}
                </Text>
                <TouchableOpacity
                  onPress={() => incrementItem(item.id)}
                  className="w-8 h-8 rounded-full bg-[#FF7F50] items-center justify-center shadow-sm shadow-[#FF7F50]/30"
                >
                  <Feather name="plus" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
