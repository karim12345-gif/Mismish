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
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthServices } from "../services/auth/auth.service";
import { AllergiesService } from "../services/user/allergies.service";
import { ALLERGY_PENDING_KEY } from "./AllergyOnboarding/AllergyOnboardingSheet";
import { useAuth } from "../context/AuthContext";
import { useUserAllergies } from "../context/AllergyContext";

const COUNTRY_CODE = "+966";
const OTP_LENGTH = 6;

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

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(56);
  const [errorMsg, setErrorMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const confirmationRef = useRef<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const otpRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

  useEffect(() => {
    if (visible) {
      setStep("phone");
      setPhone("");
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimer(56);
      setErrorMsg("");
      confirmationRef.current = null;
    }
  }, [visible]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const fullPhone = `${COUNTRY_CODE}${phone}`;

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

  const handlePhoneSubmit = async () => {
    setErrorMsg("");
    setSending(true);
    try {
      confirmationRef.current = await auth().signInWithPhoneNumber(fullPhone);
      setStep("otp");
      setTimer(56);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Failed to send code. Try again.");
    } finally {
      setSending(false);
    }
  };

  const handleOtpSubmit = async () => {
    setErrorMsg("");
    setVerifying(true);
    try {
      const credential = await confirmationRef.current!.confirm(otp.join(""));
      const idToken = await credential!.user.getIdToken();

      const response = await AuthServices.socialLogin({
        provider: "firebase_phone",
        idToken,
      });

      const { accessToken, refreshToken, user } = response.data;
      await login(accessToken, refreshToken, user);
      await syncAllergiesAfterLogin();
      onLoginSuccess();
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Invalid code. Try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      otpRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setErrorMsg("");
    setSending(true);
    try {
      confirmationRef.current = await auth().signInWithPhoneNumber(fullPhone);
      setTimer(56);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Could not resend.");
    } finally {
      setSending(false);
    }
  };

  const handleOtpChange = (val: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < OTP_LENGTH - 1) {
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
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
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
              <Text className="text-[#3A141A] font-black text-xl tracking-tight">Mismish</Text>
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
              <Text className="text-[#111] font-black text-2xl mb-1.5">Salam there 👋</Text>
              <Text className="text-gray-500 font-medium text-[14px] mb-8">
                Create an account or login to an existing account
              </Text>

              <View className="flex-row items-center border border-gray-200 rounded-xl h-[56px] px-4 bg-white mb-4">
                <View className="flex-row items-center border-r border-gray-200 pr-3 mr-3">
                  <Text className="text-[18px] mr-1">🇸🇦</Text>
                  <Feather name="chevron-down" size={14} color="#111" />
                  <Text className="text-[#111] font-bold text-[15px] ml-2">{COUNTRY_CODE}</Text>
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
                <Text className="text-red-500 text-[13px] font-medium mb-4">{errorMsg}</Text>
              )}

              <View className="flex-1 justify-end">
                <TouchableOpacity
                  onPress={handlePhoneSubmit}
                  disabled={phone.length < 8 || sending}
                  className={`h-[56px] rounded-xl items-center justify-center ${
                    phone.length >= 8 && !sending ? "bg-[#FF7F50]" : "bg-gray-200"
                  }`}
                >
                  {sending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text
                      className={`font-bold text-[16px] ${
                        phone.length >= 8 ? "text-white" : "text-gray-400"
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
              <Text className="text-[#111] font-black text-2xl mb-1.5">Verify your number</Text>
              <View className="flex-row flex-wrap mb-8">
                <Text className="text-gray-500 font-medium text-[15px] leading-6">
                  Enter the 6-digit code sent to{" "}
                </Text>
                <Text className="text-[#111] font-black text-[15px] leading-6 mr-2">
                  {COUNTRY_CODE} {phone}
                </Text>
                <TouchableOpacity onPress={() => setStep("phone")}>
                  <View className="bg-[#FF7F50] px-2.5 py-0.5 rounded-full">
                    <Text className="text-white font-bold text-[10px]">Edit</Text>
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
                        ref={(ref) => { otpRefs.current[index] = ref; }}
                        className="text-center font-black text-2xl text-[#FF7F50]"
                        maxLength={1}
                        keyboardType="number-pad"
                        value={otp[index]}
                        autoFocus={index === 0}
                        onChangeText={(val) => handleOtpChange(val, index)}
                        onKeyPress={(e) => handleOtpKeyPress(e, index)}
                      />
                    </View>
                  ))}
              </View>

              {!!errorMsg && (
                <Text className="text-red-500 text-[13px] font-medium mb-2">{errorMsg}</Text>
              )}

              <View className="flex-row items-center justify-between mb-8">
                <View className="flex-row items-center">
                  <Text className="text-[#111] font-black text-[12px] mr-1">Time remaining:</Text>
                  <Text className="text-[#00C853] font-black text-[12px]">
                    00:{timer.toString().padStart(2, "0")}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleResend} disabled={timer > 0 || sending}>
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
