import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function AddNewCardScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const isFormValid =
    name.length > 0 &&
    cardNumber.length > 10 &&
    expiry.length > 3 &&
    cvv.length > 2;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4 border-b border-gray-100 relative">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute left-5 z-10 w-8 h-8 items-center justify-center -ml-2"
        >
          <Feather name="chevron-left" size={24} color="#111" />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text-[#111] font-black text-[16px]">
            Add New Card
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-5 pt-6"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Form Fields */}
          <View className="mb-5">
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

          <View className="mb-5">
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

          <View className="flex-row items-center justify-between mb-5">
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
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Primary Action Button */}
      <View className="px-5 pt-3 pb-8 bg-white border-t border-gray-50">
        <TouchableOpacity
          disabled={!isFormValid}
          className={`w-full h-14 rounded-2xl items-center justify-center shadow-sm ${
            isFormValid ? "bg-[#FF7F50] shadow-[#FF7F50]/30" : "bg-[#E5E5E5]"
          }`}
          onPress={() => {
            // Save logic here
            navigation.goBack();
          }}
        >
          <Text
            className={`font-black text-[16px] ${isFormValid ? "text-white" : "text-gray-400"}`}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
