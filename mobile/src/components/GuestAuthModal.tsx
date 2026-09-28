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
  Animated,
  Keyboard,
  PanResponder,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthServices } from "../services/auth/auth.service";
import { AllergiesService } from "../services/user/allergies.service";
import { ALLERGY_PENDING_KEY } from "../constants/storage";
import { useAuth } from "../context/AuthContext";
import { useUserAllergies } from "../context/AllergyContext";
import { useTranslation } from "react-i18next";
import { GuestAuthPhoneStep } from "./guest-auth/GuestAuthPhoneStep";
import { GuestAuthOtpStep } from "./guest-auth/GuestAuthOtpStep";
import {
  createEmptyOtp,
  getOtpErrorMessage,
  OTP_COUNTRY_CODE,
  OTP_LENGTH,
  resolveOtpLanguage,
} from "./guest-auth/otp.utils";

const SHEET_EXPANDED_OFFSET = -72;
const SHEET_DISMISS_DISTANCE = 120;

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
  const { t, i18n } = useTranslation();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(createEmptyOtp);
  const [timer, setTimer] = useState(60);
  const [errorMsg, setErrorMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const sendingRef = useRef(false);
  const otpRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));
  const sheetOffset = useRef(new Animated.Value(0)).current;
  const sheetOffsetValue = useRef(0);

  const animateSheetTo = (toValue: number) => {
    sheetOffsetValue.current = toValue;
    Animated.spring(sheetOffset, {
      toValue,
      damping: 22,
      stiffness: 240,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Keyboard.dismiss();
    animateSheetTo(0);
    onClose();
  };

  const sheetPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_, gesture) => {
        const nextOffset = Math.max(
          SHEET_EXPANDED_OFFSET,
          sheetOffsetValue.current + gesture.dy,
        );
        sheetOffset.setValue(nextOffset);
      },
      onPanResponderRelease: (_, gesture) => {
        const releasedOffset = sheetOffsetValue.current + gesture.dy;

        if (releasedOffset > SHEET_DISMISS_DISTANCE) {
          closeSheet();
          return;
        }

        animateSheetTo(
          releasedOffset < SHEET_EXPANDED_OFFSET / 2
            ? SHEET_EXPANDED_OFFSET
            : 0,
        );
      },
      onPanResponderTerminate: () => animateSheetTo(sheetOffsetValue.current),
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      sheetOffset.setValue(0);
      sheetOffsetValue.current = 0;
      setStep("phone");
      setPhone("");
      setOtp(createEmptyOtp());
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
  const fullPhone = `${OTP_COUNTRY_CODE}${normalizedPhone}`;
  const maskedPhone = `${OTP_COUNTRY_CODE}*****${normalizedPhone.slice(-4)}`;
  const isPhoneValid = /^5\d{8}$/.test(normalizedPhone);
  const otpLanguage = resolveOtpLanguage(i18n.resolvedLanguage);

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
      setErrorMsg(getOtpErrorMessage(e, t));
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
      setErrorMsg(getOtpErrorMessage(e, t));
      setOtp(createEmptyOtp());
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
      const otpResponse = await AuthServices.resendOtp(fullPhone, otpLanguage);
      console.log("[otp] backend accepted replacement SMS request", {
        phone: maskedPhone,
      });
      setTimer(60);
      setOtp(
        otpResponse.devOtp
          ? otpResponse.devOtp.split("")
          : createEmptyOtp(),
      );
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (e: any) {
      console.log("OTP resend failed", e?.response?.data ?? e?.message ?? e);
      setErrorMsg(getOtpErrorMessage(e, t));
    } finally {
      setSending(false);
      sendingRef.current = false;
    }
  };

  const handleOtpChange = (val: string, index: number) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length > 1) {
      const nextOtp = createEmptyOtp();
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

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={closeSheet}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end"
      >
        <View className="absolute inset-0 bg-black/40">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={closeSheet}
          />
        </View>

        <Animated.View
          style={{ transform: [{ translateY: sheetOffset }] }}
          className={`bg-white rounded-t-3xl shadow-xl overflow-hidden relative ${
            step === "otp" ? "min-h-[58%] pb-7" : "min-h-[55%] pb-10"
          }`}
        >
          <View
            className="h-7 items-center justify-center"
            {...sheetPanResponder.panHandlers}
          >
            <View className="w-11 h-1 rounded-full bg-gray-300" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-1 pb-2">
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
                onPress={closeSheet}
                className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center"
              >
                <Feather name="x" size={18} color="#888" />
              </TouchableOpacity>
            </View>
          </View>

          {step === "phone" ? (
            <GuestAuthPhoneStep
              phone={phone}
              errorMessage={errorMsg}
              isPhoneValid={isPhoneValid}
              isSending={sending}
              onPhoneChange={setPhone}
              onSubmit={handlePhoneSubmit}
            />
          ) : (
            <GuestAuthOtpStep
              phone={phone}
              otp={otp}
              otpRefs={otpRefs}
              errorMessage={errorMsg}
              timer={timer}
              isSending={sending}
              isVerifying={verifying}
              onEditPhone={() => {
                setOtp(createEmptyOtp());
                setErrorMsg("");
                setStep("phone");
              }}
              onOtpChange={handleOtpChange}
              onOtpKeyPress={handleOtpKeyPress}
              onResend={handleResend}
              onSubmit={handleOtpSubmit}
            />
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
