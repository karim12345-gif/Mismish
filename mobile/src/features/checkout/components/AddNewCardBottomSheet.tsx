import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface AddNewCardBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export const AddNewCardBottomSheet = ({
  visible,
  onClose,
  onSave,
}: AddNewCardBottomSheetProps) => {
  const slideAnim = useRef(new Animated.Value(600)).current;

  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const isFormValid =
    name.length > 0 &&
    cardNumber.length > 10 &&
    expiry.length > 3 &&
    cvv.length > 2;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end bg-black/40"
      >
        <Pressable className="flex-1 w-full" onPress={onClose} />

        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
          className="bg-white rounded-t-3xl pt-5 pb-8 px-5 w-full flex flex-col"
        >
          {/* Header */}
          <View className="flex-row items-center justify-center mb-6 relative">
            <Text className="text-[#111] font-black text-[18px]">
              Add New Card
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-0 w-8 h-8 rounded-full bg-gray-300 items-center justify-center"
            >
              <Feather name="x" size={16} color="white" />
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View className="mb-4">
            <Text className="text-[#111] font-black text-[13px] mb-2">
              Name on Card
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter Name on Card"
              placeholderTextColor="#A1A1A1"
              className="w-full h-[52px] border border-gray-200 rounded-xl px-4 text-[#111] font-medium text-[14px]"
            />
          </View>

          <View className="mb-4">
            <Text className="text-[#111] font-black text-[13px] mb-2">
              Card Number
            </Text>
            <TextInput
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor="#A1A1A1"
              keyboardType="number-pad"
              maxLength={19}
              className="w-full h-[52px] border border-gray-200 rounded-xl px-4 text-[#111] font-medium text-[14px]"
            />
          </View>

          <View className="flex-row items-center justify-between mb-8">
            <View className="w-[48%]">
              <Text className="text-[#111] font-black text-[13px] mb-2">
                Expiry Date
              </Text>
              <TextInput
                value={expiry}
                onChangeText={setExpiry}
                placeholder="MM/YY"
                placeholderTextColor="#A1A1A1"
                maxLength={5}
                className="w-full h-[52px] border border-gray-200 rounded-xl px-4 text-[#111] font-medium text-[14px]"
              />
            </View>
            <View className="w-[48%]">
              <Text className="text-[#111] font-black text-[13px] mb-2">
                CVV
              </Text>
              <TextInput
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                placeholderTextColor="#A1A1A1"
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                className="w-full h-[52px] border border-gray-200 rounded-xl px-4 text-[#111] font-medium text-[14px]"
              />
            </View>
          </View>

          {/* Action */}
          <TouchableOpacity
            disabled={!isFormValid}
            className={`w-full h-14 rounded-2xl items-center justify-center shadow-sm ${
              isFormValid ? "bg-[#FF7F50] shadow-[#FF7F50]/30" : "bg-[#E5E5E5]"
            }`}
            onPress={() => {
              if (onSave) onSave();
              onClose();
            }}
          >
            <Text
              className={`font-black text-[16px] ${isFormValid ? "text-white" : "text-gray-400"}`}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
