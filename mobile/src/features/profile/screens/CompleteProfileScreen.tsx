import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useUpdateProfile } from "../../../hooks/useUpdateProfile";
import { useAuth } from "../../../context/AuthContext";

export default function CompleteProfileScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { mutate: updateProfile, isPending, error } = useUpdateProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);

  const isFormValid =
    firstName.trim().length > 0 && lastName.trim().length > 0 && agreed;

  const handleConfirm = () => {
    const name = `${firstName.trim()} ${lastName.trim()}`;
    updateProfile(
      { name, email: email.trim() || undefined },
      {
        onSuccess: () => navigation.navigate("Checkout" as never),
      },
    );
  };

  const displayPhone = user?.phoneNumber ?? "+966 — — —";

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-8 h-8 items-center justify-center -ml-2"
        >
          <Feather name="chevron-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text className="text-[#111] font-black text-[18px]">
          Complete Profile
        </Text>
        <TouchableOpacity className="w-8 h-8 items-center justify-center -mr-2">
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-8 mb-24"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[#1B4332] font-black text-3xl mb-3 tracking-tight">
          Almost there!
        </Text>
        <Text className="text-gray-600 font-medium text-[15px] leading-6 mb-10">
          We just need a few details to finalize your surprise bag booking and
          ensure a smooth pickup.
        </Text>

        {/* Name Fields */}
        <View className="flex-row items-center justify-between mb-6 space-x-4">
          <View className="flex-1 mr-2">
            <View className="flex-row items-center mb-1.5">
              <Feather name="user" size={12} color="#111" />
              <Text className="text-[#444] font-bold text-[13px] ml-1.5">
                First Name <Text className="text-[#FF7F50]">*</Text>
              </Text>
            </View>
            <TextInput
              className="border border-gray-200 rounded-xl h-12 px-4 shadow-sm shadow-black/5 bg-white font-medium text-[15px] text-[#111]"
              placeholder="e.g. Karim"
              placeholderTextColor="#A1A1A1"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View className="flex-1 ml-2">
            <View className="flex-row items-center mb-1.5">
              <Text className="text-[#444] font-bold text-[13px] ml-1">
                Last Name <Text className="text-[#FF7F50]">*</Text>
              </Text>
            </View>
            <TextInput
              className="border border-gray-200 rounded-xl h-12 px-4 shadow-sm shadow-black/5 bg-white font-medium text-[15px] text-[#111]"
              placeholder="e.g. Salim"
              placeholderTextColor="#A1A1A1"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>

        {/* Email Field */}
        <View className="mb-6">
          <View className="flex-row items-center mb-1.5">
            <Feather name="mail" size={12} color="#111" />
            <Text className="text-[#444] font-bold text-[13px] ml-1.5">
              Email Address (optional)
            </Text>
          </View>
          <TextInput
            className="border border-gray-200 rounded-xl h-12 px-4 shadow-sm shadow-black/5 bg-white font-medium text-[15px] text-[#111]"
            placeholder="e.g. hello@mismish.app"
            placeholderTextColor="#A1A1A1"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Phone Number — real from auth context */}
        <View className="mb-6">
          <View className="flex-row items-center mb-1.5">
            <Feather name="phone" size={12} color="#111" />
            <Text className="text-[#444] font-bold text-[13px] ml-1.5">
              Phone Number
            </Text>
          </View>
          <View className="border border-dashed border-gray-300 rounded-2xl p-4 flex-row items-center justify-between bg-[#FAFAFA]">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full border border-gray-200 bg-white items-center justify-center mr-3">
                <Text className="text-[18px]">🇸🇦</Text>
              </View>
              <View>
                <Text className="text-[#111] font-black text-[15px] mb-0.5">
                  {displayPhone}
                </Text>
                <Text className="text-gray-400 font-bold text-[10px] tracking-wider uppercase">
                  Verified Identity
                </Text>
              </View>
            </View>
            <View className="bg-white border border-gray-200 rounded-full px-3 py-1 flex-row items-center shadow-sm shadow-black/5">
              <Feather name="check-circle" size={11} color="#333" />
              <Text className="text-[#333] font-bold text-[11px] ml-1.5">
                Verified
              </Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setAgreed(!agreed)}
          className="bg-[#F4F9F6] border border-[#E9F3EE] rounded-2xl p-5 mb-8"
        >
          <View className="flex-row items-start">
            <View
              className={`w-5 h-5 rounded-[4px] border items-center justify-center mr-3 mt-0.5 ${
                agreed
                  ? "bg-[#FF7F50] border-[#FF7F50]"
                  : "border-gray-300 bg-white"
              }`}
            >
              {agreed && <Feather name="check" size={14} color="#FFF" />}
            </View>
            <View className="flex-1">
              <Text className="text-[#333] font-medium text-[14px] leading-5 mb-2">
                I agree to the{" "}
                <Text className="text-[#FF7F50] font-bold underline">
                  Terms & Conditions
                </Text>{" "}
                and{" "}
                <Text className="text-[#FF7F50] font-bold underline">
                  Privacy Policy
                </Text>
                .
              </Text>
              <View className="flex-row items-center">
                <Feather name="info" size={12} color="#666" />
                <Text className="text-gray-500 text-[11px] font-medium ml-1.5">
                  Required to process your booking
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {error && (
          <Text className="text-red-500 text-[13px] font-medium mb-4 text-center">
            Failed to save profile. Please try again.
          </Text>
        )}
      </ScrollView>

      {/* Sticky Footer */}
      <View className="absolute bottom-0 w-full bg-white pt-4 pb-10 border-t border-gray-100 px-5 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
        <TouchableOpacity
          disabled={!isFormValid || isPending}
          onPress={handleConfirm}
          className={`w-full h-14 rounded-2xl items-center justify-center shadow-sm ${
            isFormValid && !isPending
              ? "bg-[#FF7F50] shadow-[#FF7F50]/30"
              : "bg-gray-100"
          }`}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              className={`font-black text-[16px] ${
                isFormValid ? "text-white" : "text-gray-400"
              }`}
            >
              Confirm Order
            </Text>
          )}
        </TouchableOpacity>
        <Text className="text-center text-gray-400 font-bold text-[9px] tracking-widest mt-5 mb-4 uppercase">
          Secure Checkout • Mismish English V1.0
        </Text>
      </View>
    </SafeAreaView>
  );
}
