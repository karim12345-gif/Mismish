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
            {/* Apple Pay List Item */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                onSelectMethod?.("apple_pay");
                onClose();
              }}
              className={`flex-row items-center p-4 rounded-xl border ${
                selectedMethod === "apple_pay"
                  ? "border-black"
                  : "border-gray-100"
              }`}
            >
              <View className="w-8 items-center justify-center mr-3">
                <FontAwesome name="apple" size={22} color="#111" />
              </View>
              <Text className="text-[#111] font-bold text-[14px]">
                Apple Pay
              </Text>
            </TouchableOpacity>

            {/* STC Pay New */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                onSelectMethod?.("stc_pay_new");
                onClose();
              }}
              className={`flex-row items-center p-4 rounded-xl border ${
                selectedMethod === "stc_pay_new"
                  ? "border-[#FF7F50]"
                  : "border-gray-100"
              }`}
            >
              <View className="w-8 flex-row items-center justify-center mr-3">
                <Text className="text-purple-700 font-black italic text-[11px] leading-none tracking-tighter">
                  stc
                </Text>
                <Text className="text-gray-500 font-bold italic text-[10px] leading-none ml-0.5">
                  pay
                </Text>
              </View>
              <Text className="text-[#111] font-bold text-[14px]">
                New stc Pay Account
              </Text>
            </TouchableOpacity>

            {/* STC Pay Number */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                onSelectMethod?.("stc_pay_number");
                onClose();
              }}
              className={`flex-row items-center p-4 rounded-xl border ${
                selectedMethod === "stc_pay_number"
                  ? "border-[#FF7F50]"
                  : "border-gray-100"
              }`}
            >
              <View className="w-8 flex-row items-center justify-center mr-3">
                <Text className="text-purple-700 font-black italic text-[11px] leading-none tracking-tighter">
                  stc
                </Text>
                <Text className="text-gray-500 font-bold italic text-[10px] leading-none ml-0.5">
                  pay
                </Text>
              </View>
              <Text className="text-[#111] font-bold text-[14px]">
                0546725578
              </Text>
            </TouchableOpacity>
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
