import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthServices } from "../services/auth/auth.service";
import { AllergiesService } from "../services/user/allergies.service";
import { ALLERGY_PENDING_KEY } from "../constants/storage";
import { useAuth } from "../context/AuthContext";
import { useUserAllergies } from "../context/AllergyContext";
import { useTranslation } from "react-i18next";

const COUNTRY_CODE = "+966";
const OTP_LENGTH = 4;

const otpErrorMessage = (error: any) => {
  const code =
    error?.response?.data?.error?.code ?? error?.code ?? error?.nativeErrorCode;

  if (code === "auth/invalid-verification-code") {
    return "That code is incorrect. Enter the newest code from your SMS.";
  }
  if (code === "invalid_otp") {
    return "That code is incorrect. Enter the newest code from your SMS.";
  }
  if (code === "auth/session-expired" || code === "auth/code-expired") {
    return "That code has expired. Request a new code and try again.";
  }
  if (code === "auth/too-many-requests") {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  if (code === "auth/invalid-phone-number") {
    return "Enter a valid Saudi mobile number without the country code.";
  }

  return (
    error?.response?.data?.error?.message ??
    error?.response?.data?.message ??
    "We could not verify that code. Please request a new one."
  );
};

interface GuestAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const GuestAuthModal = ({
  visible,
  onClose,
  onLoginSuccess,
}: GuestAuthModalProps) => {
  const { login } = useAuth();
  const { setUserAllergies } = useUserAllergies();
  const { i18n } = useTranslation();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(60);
  const [errorMsg, setErrorMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const sendingRef = useRef(false);
  const otpRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

  useEffect(() => {
    if (visible) {
      setStep("phone");
      setPhone("");
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimer(60);
      setErrorMsg("");
    }
  }, [visible]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const normalizedPhone = phone.replace(/\D/g, "").replace(/^0/, "");
  const fullPhone = `${COUNTRY_CODE}${normalizedPhone}`;
  const maskedPhone = `${COUNTRY_CODE}*****${normalizedPhone.slice(-4)}`;
  const isPhoneValid = /^5\d{8}$/.test(normalizedPhone);
  const otpLanguage: "en" | "ar" =
    i18n.resolvedLanguage === "ar" ? "ar" : "en";

  const syncAllergiesAfterLogin = async () => {
    const pending = await AsyncStorage.getItem(ALLERGY_PENDING_KEY);
    if (pending) {
      try {
        const allergies: string[] = JSON.parse(pending);
        if (allergies.length > 0) {
          await AllergiesService.updateAllergies(allergies);
          setUserAllergies(allergies);
        }
      } catch {}
      await AsyncStorage.removeItem(ALLERGY_PENDING_KEY);
    } else {
      try {
        const existing = await AllergiesService.getAllergies();
        if (existing.length > 0) setUserAllergies(existing);
      } catch {}
    }
  };

  const completeLogin = async (
    response: Awaited<ReturnType<typeof AuthServices.verifyOtp>>,
  ) => {
    const { accessToken, refreshToken, user } = response.data;

    await login(accessToken, refreshToken, user);
    await syncAllergiesAfterLogin();
    onLoginSuccess();
  };

  const handlePhoneSubmit = async () => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setErrorMsg("");
    setSending(true);
    try {
      console.log("[otp] requesting SMS", { phone: maskedPhone });
      const otpResponse = await AuthServices.sendOtp({
        phoneNumber: fullPhone,
        language: otpLanguage,
      });
      console.log("[otp] backend accepted SMS request", {
        phone: maskedPhone,
      });
      setStep("otp");
      setTimer(60);
      if (otpResponse.devOtp) {
        setOtp(otpResponse.devOtp.split(""));
      }
    } catch (e: any) {
      console.log("OTP send failed", e?.response?.data ?? e?.message ?? e, {
        error: e,
      });
      setErrorMsg(otpErrorMessage(e));
    } finally {
      setSending(false);
      sendingRef.current = false;
    }
  };

  const handleOtpSubmit = async () => {
    setErrorMsg("");
    setVerifying(true);
    try {
      const response = await AuthServices.verifyOtp({
        phoneNumber: fullPhone,
        otp: otp.join(""),
      });
      await completeLogin(response);
    } catch (e: any) {
      console.log(
        "OTP verification failed",
        e?.response?.data ?? e?.message ?? e,
      );
      setErrorMsg(otpErrorMessage(e));
      setOtp(Array(OTP_LENGTH).fill(""));
      otpRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setErrorMsg("");
    setSending(true);
    try {
      console.log("[otp] requesting replacement SMS", { phone: maskedPhone });
      const otpResponse = await AuthServices.resendOtp(
        fullPhone,
        otpLanguage,
      );
      console.log("[otp] backend accepted replacement SMS request", {
        phone: maskedPhone,
      });
      setTimer(60);
      setOtp(
        otpResponse.devOtp
          ? otpResponse.devOtp.split("")
          : Array(OTP_LENGTH).fill(""),
      );
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (e: any) {
      console.log("OTP resend failed", e?.response?.data ?? e?.message ?? e);
      setErrorMsg(otpErrorMessage(e));
    } finally {
      setSending(false);
      sendingRef.current = false;
    }
  };

  const handleOtpChange = (val: string, index: number) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length > 1) {
      const nextOtp = Array(OTP_LENGTH).fill("");
      digits
        .slice(0, OTP_LENGTH)
        .split("")
        .forEach((digit, digitIndex) => {
          nextOtp[digitIndex] = digit;
        });
      setOtp(nextOtp);
      otpRefs.current[Math.min(digits.length, OTP_LENGTH) - 1]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digits;
    setOtp(newOtp);
    if (digits && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const otpComplete = otp.join("").length === OTP_LENGTH;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end"
      >
        <View className="absolute inset-0 bg-black/40">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={onClose}
          />
        </View>

        <View className="bg-white rounded-t-3xl min-h-[55%] pb-10 shadow-xl overflow-hidden relative">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-6 pb-2">
            <View className="flex-1" />
            <View className="flex-row items-center flex-1 justify-center">
              <Image
                source={require("../../assets/images/Layer_1.png")}
                className="w-8 h-8 mr-2"
                resizeMode="contain"
              />
              <Text className="text-[#3A141A] font-black text-xl tracking-tight">
                Mismish
              </Text>
            </View>
            <View className="flex-1 items-end">
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center"
              >
                <Feather name="x" size={18} color="#888" />
              </TouchableOpacity>
            </View>
          </View>

          {step === "phone" ? (
            <View className="px-5 pt-6 flex-1">
              <Text className="text-[#111] font-black text-2xl mb-1.5">
                Salam there 👋
              </Text>
              <Text className="text-gray-500 font-medium text-[14px] mb-8">
                Create an account or login to an existing account
              </Text>

              <View className="flex-row items-center border border-gray-200 rounded-xl h-[56px] px-4 bg-white mb-4">
                <View className="flex-row items-center border-r border-gray-200 pr-3 mr-3">
                  <Text className="text-[18px] mr-1">🇸🇦</Text>
                  <Feather name="chevron-down" size={14} color="#111" />
                  <Text className="text-[#111] font-bold text-[15px] ml-2">
                    {COUNTRY_CODE}
                  </Text>
                </View>
                <TextInput
                  className="flex-1 font-medium text-[16px] text-[#111]"
                  placeholder="xxxxxxxxx"
                  placeholderTextColor="#A1A1A1"
                  keyboardType="phone-pad"
                  maxLength={9}
                  value={phone}
                  onChangeText={setPhone}
                  autoFocus
                />
              </View>

              {!!errorMsg && (
                <Text className="text-red-500 text-[13px] font-medium mb-4">
                  {errorMsg}
                </Text>
              )}

              <View className="flex-1 justify-end">
                <TouchableOpacity
                  onPress={handlePhoneSubmit}
                  disabled={!isPhoneValid || sending}
                  className={`h-[56px] rounded-xl items-center justify-center ${
                    isPhoneValid && !sending
                      ? "bg-[#FF7F50]"
                      : "bg-gray-200"
                  }`}
                >
                  {sending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text
                      className={`font-bold text-[16px] ${
                        isPhoneValid ? "text-white" : "text-gray-400"
                      }`}
                    >
                      Send Code
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="px-5 pt-6 flex-1">
              <Text className="text-[#111] font-black text-2xl mb-1.5">
                Verify your number
              </Text>
              <View className="flex-row flex-wrap mb-8">
                <Text className="text-gray-500 font-medium text-[15px] leading-6">
                  Enter the 4-digit code sent to{" "}
                </Text>
                <Text className="text-[#111] font-black text-[15px] leading-6 mr-2">
                  {COUNTRY_CODE} {phone}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setOtp(Array(OTP_LENGTH).fill(""));
                    setErrorMsg("");
                    setStep("phone");
                  }}
                >
                  <View className="bg-[#FF7F50] px-2.5 py-0.5 rounded-full">
                    <Text className="text-white font-bold text-[10px]">
                      Edit
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-between mb-4">
                {Array(OTP_LENGTH)
                  .fill(null)
                  .map((_, index) => (
                    <View
                      key={index}
                      className={`w-[46px] h-[56px] rounded-2xl items-center justify-center border ${
                        otp[index]
                          ? "border-[#FF7F50]"
                          : index === otp.findIndex((v) => v === "")
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
                        onChangeText={(val) => handleOtpChange(val, index)}
                        onKeyPress={(e) => handleOtpKeyPress(e, index)}
                      />
                    </View>
                  ))}
              </View>

              {!!errorMsg && (
                <Text className="text-red-500 text-[13px] font-medium mb-2">
                  {errorMsg}
                </Text>
              )}

              <View className="flex-row items-center justify-between mb-8">
                <View className="flex-row items-center">
                  <Text className="text-[#111] font-black text-[12px] mr-1">
                    Time remaining:
                  </Text>
                  <Text className="text-[#00C853] font-black text-[12px]">
                    00:{timer.toString().padStart(2, "0")}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={timer > 0 || sending}
                >
                  <Text
                    className={`font-black text-[12px] ${timer > 0 ? "text-gray-300" : "text-[#FF7F50]"}`}
                  >
                    Resend code
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-1 justify-end">
                <TouchableOpacity
                  onPress={handleOtpSubmit}
                  disabled={!otpComplete || verifying}
                  className={`h-[56px] rounded-xl items-center justify-center ${
                    otpComplete && !verifying ? "bg-[#FF7F50]" : "bg-gray-200"
                  }`}
                >
                  {verifying ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text
                      className={`font-bold text-[16px] ${otpComplete ? "text-white" : "text-gray-400"}`}
                    >
                      Continue
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
