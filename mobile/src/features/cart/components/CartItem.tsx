import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";

import { CartItemProduct } from "../../../context/CartContext";

interface CartItemProps {
  item: CartItemProduct;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const CartItem = ({ item, onIncrement, onDecrement }: CartItemProps) => {
  return (
    <View className="flex-row items-center justify-between px-5 py-6 border-b border-gray-100 bg-white">
      {/* Item Info */}
      <View className="flex-row items-center flex-1 mr-4">
        <View className="w-14 h-14 bg-[#F8F6F2] rounded-xl mr-4 items-center justify-center border border-gray-100 overflow-hidden">
          {item.imageUrl ? (
            <React.Fragment>
              <Image
                source={{ uri: item.imageUrl }}
                className="w-full h-full rounded-xl"
              />
            </React.Fragment>
          ) : (
            <Text className="text-[20px]">🍩</Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-[#111] font-bold text-[15px] mb-1">
            {item.title}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-[#FF7F50] font-black text-[14px] mr-2">
              ﷼ {item.price.toFixed(2)}
            </Text>
            {item.originalPrice && (
              <Text className="text-gray-400 font-bold text-[12px] line-through decoration-dotted">
                ﷼ {item.originalPrice.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Logic Stepper */}
      <View className="flex-row items-center border border-gray-200 rounded-xl px-1 py-1 bg-white shadow-sm shadow-black/5">
        <TouchableOpacity
          className="w-8 h-8 items-center justify-center rounded-lg bg-gray-100"
          onPress={onDecrement}
        >
          {item.quantity === 1 ? (
            <Feather name="trash-2" size={14} color="#E7246A" />
          ) : (
            <Feather name="minus" size={16} color="#333" />
          )}
        </TouchableOpacity>

        <Text className="text-[#111] font-black text-[14px] w-6 text-center">
          {item.quantity}
        </Text>

        <TouchableOpacity
          className="w-8 h-8 items-center justify-center rounded-lg"
          onPress={onIncrement}
        >
          <Feather name="plus" size={16} color="#E7246A" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
