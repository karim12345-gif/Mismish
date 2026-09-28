import React from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { OTP_COUNTRY_CODE } from "./otp.utils";

interface GuestAuthPhoneStepProps {
  phone: string;
  errorMessage: string;
  isPhoneValid: boolean;
  isSending: boolean;
  onPhoneChange: (phone: string) => void;
  onSubmit: () => void;
}

export const GuestAuthPhoneStep = ({
  phone,
  errorMessage,
  isPhoneValid,
  isSending,
  onPhoneChange,
  onSubmit,
}: GuestAuthPhoneStepProps) => {
  const { t } = useTranslation();

  return (
    <View className="px-5 pt-6 flex-1">
      <Text className="text-[#111] font-black text-2xl mb-1.5">
        {t("auth.otp.greeting")}
      </Text>
      <Text className="text-gray-500 font-medium text-[14px] mb-8">
        {t("auth.otp.login_prompt")}
      </Text>

      <View className="flex-row items-center border border-gray-200 rounded-xl h-[56px] px-4 bg-white mb-4">
        <View className="flex-row items-center border-r border-gray-200 pr-3 mr-3">
          <Text className="text-[18px] mr-1">🇸🇦</Text>
          <Feather name="chevron-down" size={14} color="#111" />
          <Text className="text-[#111] font-bold text-[15px] ml-2">
            {OTP_COUNTRY_CODE}
          </Text>
        </View>
        <TextInput
          className="flex-1 font-medium text-[16px] text-[#111]"
          placeholder="xxxxxxxxx"
          placeholderTextColor="#A1A1A1"
          keyboardType="phone-pad"
          maxLength={9}
          value={phone}
          onChangeText={onPhoneChange}
          autoFocus
        />
      </View>

      {!!errorMessage && (
        <Text className="text-red-500 text-[13px] font-medium mb-4">
          {errorMessage}
        </Text>
      )}

      <View className="flex-1 justify-end">
        <TouchableOpacity
          onPress={onSubmit}
          disabled={!isPhoneValid || isSending}
          className={`h-[56px] rounded-xl items-center justify-center ${
            isPhoneValid && !isSending ? "bg-[#FF7F50]" : "bg-gray-200"
          }`}
        >
          {isSending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              className={`font-bold text-[16px] ${
                isPhoneValid ? "text-white" : "text-gray-400"
              }`}
            >
              {t("auth.otp.send_code")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
