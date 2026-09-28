import React, { type MutableRefObject } from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { OTP_COUNTRY_CODE, OTP_LENGTH } from "./otp.utils";

interface GuestAuthOtpStepProps {
  phone: string;
  otp: string[];
  otpRefs: MutableRefObject<Array<TextInput | null>>;
  errorMessage: string;
  timer: number;
  isSending: boolean;
  isVerifying: boolean;
  onEditPhone: () => void;
  onOtpChange: (value: string, index: number) => void;
  onOtpKeyPress: (key: string, index: number) => void;
  onResend: () => void;
  onSubmit: () => void;
}

export const GuestAuthOtpStep = ({
  phone,
  otp,
  otpRefs,
  errorMessage,
  timer,
  isSending,
  isVerifying,
  onEditPhone,
  onOtpChange,
  onOtpKeyPress,
  onResend,
  onSubmit,
}: GuestAuthOtpStepProps) => {
  const { t } = useTranslation();
  const otpComplete = otp.join("").length === OTP_LENGTH;
  const activeIndex = otp.findIndex((value) => value === "");

  return (
    <View className="px-5 pt-5">
      <Text className="text-[#111] font-black text-2xl mb-1.5">
        {t("auth.otp.verify_title")}
      </Text>
      <View className="flex-row flex-wrap mb-5">
        <Text className="text-gray-500 font-medium text-[15px] leading-6">
          {t("auth.otp.verify_instruction")} {" "}
        </Text>
        <Text className="text-[#111] font-black text-[15px] leading-6 mr-2">
          {OTP_COUNTRY_CODE} {phone}
        </Text>
        <TouchableOpacity onPress={onEditPhone}>
          <View className="bg-[#FF7F50] px-2.5 py-0.5 rounded-full">
            <Text className="text-white font-bold text-[10px]">
              {t("auth.otp.edit")}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center mb-5">
        {Array(OTP_LENGTH)
          .fill(null)
          .map((_, index) => (
            <View
              key={index}
              className={`w-[52px] h-[58px] mx-1.5 rounded-xl items-center justify-center border ${
                otp[index] || index === activeIndex
                  ? "border-[#FF7F50]"
                  : "border-gray-200"
              }`}
            >
              <TextInput
                ref={(ref) => {
                  otpRefs.current[index] = ref;
                }}
                className="text-center font-black text-2xl text-[#FF7F50]"
                maxLength={index === 0 ? OTP_LENGTH : 1}
                keyboardType="number-pad"
                textContentType={index === 0 ? "oneTimeCode" : "none"}
                autoComplete={
                  index === 0
                    ? Platform.OS === "ios"
                      ? "one-time-code"
                      : "sms-otp"
                    : "off"
                }
                importantForAutofill="yes"
                value={otp[index]}
                autoFocus={index === 0}
                onChangeText={(value) => onOtpChange(value, index)}
                onKeyPress={(event) =>
                  onOtpKeyPress(event.nativeEvent.key, index)
                }
              />
            </View>
          ))}
      </View>

      {!!errorMessage && (
        <Text className="text-red-500 text-[13px] font-medium mb-2">
          {errorMessage}
        </Text>
      )}

      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-row items-center">
          <Text className="text-[#111] font-black text-[12px] mr-1">
            {t("auth.otp.time_remaining")}
          </Text>
          <Text className="text-[#00C853] font-black text-[12px]">
            00:{timer.toString().padStart(2, "0")}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onResend}
          disabled={timer > 0 || isSending}
        >
          <Text
            className={`font-black text-[12px] ${
              timer > 0 ? "text-gray-300" : "text-[#FF7F50]"
            }`}
          >
            {t("auth.otp.resend_code")}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={onSubmit}
        disabled={!otpComplete || isVerifying}
        className={`h-[52px] rounded-xl items-center justify-center ${
          otpComplete && !isVerifying ? "bg-[#FF7F50]" : "bg-gray-200"
        }`}
      >
        {isVerifying ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            className={`font-bold text-[16px] ${
              otpComplete ? "text-white" : "text-gray-400"
            }`}
          >
            {t("auth.otp.continue")}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
