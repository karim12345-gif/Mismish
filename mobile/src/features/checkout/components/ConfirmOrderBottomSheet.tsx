import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface ConfirmOrderBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const ConfirmOrderBottomSheet = ({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
}: ConfirmOrderBottomSheetProps) => {
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
          className="bg-white rounded-t-3xl pt-6 pb-10 px-5 w-full flex flex-col"
        >
          {/* Header */}
          <View className="mb-6 items-center flex-row justify-center relative">
            <Text className="text-[#111] font-black text-[18px]">
              Confirm Order
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-0 w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            >
              <Feather name="x" size={16} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Details Box */}
          <View className="border border-gray-100 rounded-2xl p-5 mb-8 bg-white shadow-sm shadow-black/5">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-[#111] font-black text-[15px]">
                Order Type
              </Text>
              <View className="bg-[#FFF0EB] px-3 py-1 rounded-full border border-[#FFE0D6]">
                <Text className="text-[#FF7F50] font-black text-[12px]">
                  Self Pickup
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-[#111] font-black text-[15px]">
                Pickup Date
              </Text>
              <Text className="text-gray-500 font-medium text-[14px]">
                Today
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-[#111] font-black text-[15px]">
                Pickup Time
              </Text>
              <Text className="text-gray-500 font-medium text-[14px]">
                9:00 PM - 12:00 AM
              </Text>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={onConfirm}
            disabled={isLoading}
            className={`w-full h-14 rounded-2xl items-center justify-center shadow-sm ${
              isLoading ? "bg-gray-200" : "bg-[#FF7F50] shadow-[#FF7F50]/30"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#FF7F50" />
            ) : (
              <Text className="text-white font-black text-[16px]">Confirm</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
