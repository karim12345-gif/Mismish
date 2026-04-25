import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

interface HowMismishWorksModalProps {
  visible: boolean;
  onClose: () => void;
  onContinue: (dontShowAgain: boolean) => void;
}

export const HowMismishWorksModal = ({
  visible,
  onClose,
  onContinue,
}: HowMismishWorksModalProps) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={StyleSheet.absoluteFillObject} className="justify-end">
        {/* Overlay */}
        <View className="absolute inset-0 bg-black/40">
          <TouchableOpacity
            className="flex-1"
            onPress={onClose}
            activeOpacity={1}
          />
        </View>

        {/* Sheet Content */}
        <View className="bg-white rounded-t-3xl pt-8 px-6 pb-10 items-center shadow-lg">
          {/* Close Button X - absolute top right */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full items-center justify-center bg-gray-200/80"
          >
            <Feather name="x" size={16} color="#666" />
          </TouchableOpacity>

          {/* Icon Header */}
          <View className="w-16 h-16 bg-[#FF7F50] rounded-2xl items-center justify-center mb-6 shadow-sm shadow-[#FF7F50]/30 transform rotate-[-5deg]">
            <View className="transform rotate-[5deg]">
              <Feather name="shopping-bag" size={32} color="#FFF" />
            </View>
          </View>

          {/* Title */}
          <Text className="text-[#111] font-black text-[22px] text-center mb-4 leading-tight">
            How does a Mismish{"\n"}Bag work?
          </Text>

          {/* Explanation */}
          <Text className="text-[#666] text-center text-[14px] leading-6 mb-8 px-2 font-medium">
            The store carefully selects the bag contents from available products
            — items cannot be modified or individually chosen.
          </Text>

          {/* Checkbox */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setDontShowAgain(!dontShowAgain)}
            className="flex-row items-center mb-8"
          >
            <View
              className={`w-5 h-5 rounded border items-center justify-center mr-3 ${
                dontShowAgain
                  ? "bg-[#FF7F50] border-[#FF7F50]"
                  : "border-gray-300"
              }`}
            >
              {dontShowAgain && <Feather name="check" size={14} color="#FFF" />}
            </View>
            <Text className="text-[#555] font-medium text-[14px]">
              Don't show this again
            </Text>
          </TouchableOpacity>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={() => onContinue(dontShowAgain)}
            className="w-full bg-[#FF7F50] py-[15px] rounded-2xl items-center justify-center shadow-sm shadow-[#FF7F50]/20"
          >
            <Text className="text-white font-bold text-[16px]">Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
