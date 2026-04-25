import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface AvailabilityTimeBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: "today" | "tomorrow";
  onSelectDate: (date: "today" | "tomorrow") => void;
}

export const AvailabilityTimeBottomSheet = ({
  visible,
  onClose,
  selectedDate,
  onSelectDate,
}: AvailabilityTimeBottomSheetProps) => {
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
              Availability Time
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-0 w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            >
              <Feather name="x" size={16} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Options Grid */}
          <View className="flex-row justify-between mb-8">
            {/* Today */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onSelectDate("today")}
              className={`w-[48%] rounded-xl p-4 border ${
                selectedDate === "today"
                  ? "border-[#FF7F50]"
                  : "border-gray-200"
              }`}
            >
              <View
                className={`w-5 h-5 rounded-full border-2 mb-4 justify-center items-center ${
                  selectedDate === "today"
                    ? "border-[#FF7F50]"
                    : "border-gray-300"
                }`}
              >
                {selectedDate === "today" && (
                  <View className="w-3 h-3 bg-[#FF7F50] rounded-full" />
                )}
              </View>
              <Text className="text-gray-500 font-medium text-[12px] mb-1">
                Mon, 20 Apr
              </Text>
              <View className="flex-row items-center mb-1.5">
                <Feather name="clock" size={20} color="#111" />
                <Text className="text-[#111] font-black text-[16px] ml-1.5">
                  Today
                </Text>
              </View>
              <Text className="text-gray-400 font-medium text-[11px]">
                9:00 PM - 12:00 AM
              </Text>
            </TouchableOpacity>

            {/* Tomorrow */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onSelectDate("tomorrow")}
              className={`w-[48%] rounded-xl p-4 border ${
                selectedDate === "tomorrow"
                  ? "border-[#FF7F50]"
                  : "border-gray-200"
              }`}
            >
              <View
                className={`w-5 h-5 rounded-full border-2 mb-4 justify-center items-center ${
                  selectedDate === "tomorrow"
                    ? "border-[#FF7F50]"
                    : "border-gray-300"
                }`}
              >
                {selectedDate === "tomorrow" && (
                  <View className="w-3 h-3 bg-[#FF7F50] rounded-full" />
                )}
              </View>
              <Text className="text-gray-500 font-medium text-[12px] mb-1">
                Tue, 21 Apr
              </Text>
              <View className="flex-row items-center mb-1.5">
                <Feather name="calendar" size={20} color="#111" />
                <Text className="text-[#111] font-black text-[16px] ml-1.5">
                  Tomorrow
                </Text>
              </View>
              <Text className="text-gray-400 font-medium text-[11px]">
                9:00 PM - 12:00 AM
              </Text>
            </TouchableOpacity>
          </View>

          {/* Change Button */}
          <TouchableOpacity
            onPress={onClose}
            className="w-full h-14 bg-[#FF7F50] rounded-2xl items-center justify-center shadow-sm shadow-[#FF7F50]/30"
          >
            <Text className="text-white font-black text-[16px]">Change</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
