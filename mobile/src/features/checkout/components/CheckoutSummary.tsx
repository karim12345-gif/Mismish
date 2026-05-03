import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useCart } from "../../../context/CartContext";
import { useCards } from "../../../context/CardsContext";

interface CheckoutSummaryProps {
  onChangePaymentPress: () => void;
  selectedMethod?: string;
}

export const CheckoutSummary = ({ onChangePaymentPress, selectedMethod = "apple_pay" }: CheckoutSummaryProps) => {
  const { cartItems, subtotal } = useCart();
  const { cards } = useCards();

  const selectedCard = selectedMethod.startsWith("card_")
    ? cards.find((c) => c.id === selectedMethod.replace("card_", ""))
    : null;

  const originalTotal = cartItems.reduce(
    (sum, item) => sum + (item.originalPrice ?? item.price) * item.quantity,
    0,
  );
  const savings = originalTotal - subtotal;

  return (
    <View className="bg-white border-t-[8px] border-gray-50 mb-40">
      <View className="px-5 py-5 border-b border-gray-100">
        <Text className="text-[#111] font-black text-[15px] mb-4">
          Payment Method
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            {selectedCard ? (
              <>
                <FontAwesome
                  name={selectedCard.brand === "visa" ? "cc-visa" : selectedCard.brand === "mastercard" ? "cc-mastercard" : "credit-card"}
                  size={24}
                  color="#111"
                />
                <View className="ml-3">
                  <Text className="text-gray-500 font-medium text-[14px]">•••• {selectedCard.last4}</Text>
                  <Text className="text-gray-400 text-[11px]">{selectedCard.expiry}</Text>
                </View>
              </>
            ) : (
              <>
                <FontAwesome name="apple" size={24} color="#111" />
                <Text className="text-gray-500 font-medium text-[14px] ml-3">Apple Pay</Text>
              </>
            )}
          </View>
          <TouchableOpacity
            onPress={onChangePaymentPress}
            className="border border-[#FF7F50] rounded-xl py-1.5 px-4 shadow-sm shadow-black/5 bg-white"
          >
            <Text className="text-[#FF7F50] font-bold text-[13px]">Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-5 py-5">
        <Text className="text-[#111] font-black text-[15px] mb-4">
          Order Summary
        </Text>

        {originalTotal > subtotal && (
          <>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[#111] font-medium text-[13px]">
                Total Before Discount
              </Text>
              <Text className="text-[#111] font-black text-[13px] line-through decoration-dotted">
                SAR {originalTotal.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[#18C96D] font-medium text-[13px]">
                Mismish Discount 🪄
              </Text>
              <Text className="text-[#18C96D] font-black text-[13px]">
                - SAR {savings.toFixed(2)}
              </Text>
            </View>
          </>
        )}

        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-[#111] font-medium text-[13px]">Sub-total</Text>
          <Text className="text-[#111] font-black text-[13px]">SAR {subtotal.toFixed(2)}</Text>
        </View>

        <Text className="text-gray-400 font-bold text-[10px] italic mb-5">
          All prices inclusive of VAT
        </Text>

        <View className="h-[1px] bg-gray-100 mb-5" />

        <View className="flex-row items-center justify-between">
          <Text className="text-[#111] font-black text-[16px]">
            Total Amount
          </Text>
          <Text className="text-[#111] font-black text-[16px]">SAR {subtotal.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
};
