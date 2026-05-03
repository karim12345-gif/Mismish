import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
} from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useCards } from "../../../context/CardsContext";

interface PaymentMethodBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedMethod?: string;
  onSelectMethod?: (method: string) => void;
  onAddCardPress?: () => void;
}

export const PaymentMethodBottomSheet = ({
  visible,
  onClose,
  selectedMethod = "apple_pay",
  onSelectMethod,
  onAddCardPress,
}: PaymentMethodBottomSheetProps) => {
  const slideAnim = useRef(new Animated.Value(500)).current;
  const { cards } = useCards();

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 500,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="flex-1 w-full" onPress={onClose} />

        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
          className="bg-white rounded-t-3xl pt-5 pb-10 px-5 w-full flex flex-col"
        >
          {/* Header */}
          <View className="flex-row items-center justify-center mb-6 relative">
            <Text className="text-[#111] font-black text-[18px]">
              Payment Method
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-0 w-8 h-8 rounded-full bg-gray-300 items-center justify-center"
            >
              <Feather name="x" size={16} color="white" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View className="space-y-3">
            {/* Apple Pay */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => { onSelectMethod?.("apple_pay"); onClose(); }}
              className={`flex-row items-center p-4 rounded-xl border ${selectedMethod === "apple_pay" ? "border-[#366150]" : "border-gray-100"}`}
            >
              <View className="w-8 items-center justify-center mr-3">
                <FontAwesome name="apple" size={22} color="#111" />
              </View>
              <Text className="text-[#111] font-bold text-[14px] flex-1">Apple Pay</Text>
              {selectedMethod === "apple_pay" && <Feather name="check-circle" size={18} color="#366150" />}
            </TouchableOpacity>

            {/* Saved cards */}
            {cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                activeOpacity={0.7}
                onPress={() => { onSelectMethod?.(`card_${card.id}`); onClose(); }}
                className={`flex-row items-center p-4 rounded-xl border ${selectedMethod === `card_${card.id}` ? "border-[#366150]" : "border-gray-100"}`}
              >
                <View className="w-8 items-center justify-center mr-3">
                  <FontAwesome
                    name={card.brand === "visa" ? "cc-visa" : card.brand === "mastercard" ? "cc-mastercard" : "credit-card"}
                    size={22}
                    color="#111"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[#111] font-bold text-[14px]">•••• {card.last4}</Text>
                  <Text className="text-gray-400 text-[11px] font-medium">{card.name} · {card.expiry}</Text>
                </View>
                {selectedMethod === `card_${card.id}` && <Feather name="check-circle" size={18} color="#366150" />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Add New Card Action */}
          <TouchableOpacity
            className="flex-row items-center mt-6 ml-2"
            onPress={() => onAddCardPress?.()}
          >
            <Feather name="plus" size={16} color="#888" className="mr-2" />
            <Text className="text-gray-600 font-bold text-[13px] ml-1">
              Add New Card
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
