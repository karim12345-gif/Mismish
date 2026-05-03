import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";
import { useUpdateProfile } from "../../../hooks/useUpdateProfile";

export type Country = { flag: string; name: string; code: string };

const COUNTRIES: Country[] = [
  { flag: "🇸🇦", name: "Saudi Arabia", code: "+966" },
];

export default function PersonalInfoScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const parts = (user?.name ?? "").split(" ");
  const [firstName, setFirstName] = useState(parts[0] ?? "");
  const [lastName, setLastName]   = useState(parts.slice(1).join(" ") ?? "");
  const [email, setEmail]         = useState(user?.email ?? "");
  const [touched, setTouched]     = useState(false);
  const [country, setCountry]     = useState<Country>(COUNTRIES[0]);
  const [sheetVisible, setSheetVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;

  const openSheet = () => {
    setSheetVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
      speed: 18,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSheetVisible(false));
  };

  const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
  const firstErr = touched && firstName.trim().length === 0;
  const isDirty  = fullName !== (user?.name ?? "") || email.trim() !== (user?.email ?? "");
  const canSave  = firstName.trim().length > 0 && isDirty;

  const handleSave = () => {
    setTouched(true);
    if (!canSave || isPending) return;
    updateProfile(
      { name: fullName, email: email.trim() || undefined },
      { onSuccess: () => navigation.goBack() },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="chevron-left" size={26} color="#111" />
        </TouchableOpacity>
        <Text className="text-[#111] text-[17px] font-semibold">Update profile</Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, gap: 20 }}
        >
          {/* First + Last Name */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-[#111] text-[13px] font-semibold mb-2">First Name</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="karim"
                placeholderTextColor="#bbb"
                autoCapitalize="words"
                className="border rounded-2xl px-4 py-4 text-[15px] text-[#111]"
                style={{ borderColor: firstErr ? "#EF4444" : "#E5E7EB" }}
              />
              {firstErr && (
                <Text className="text-red-500 text-[11px] mt-1">Required</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-[#111] text-[13px] font-semibold mb-2">Last Name</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="salim"
                placeholderTextColor="#bbb"
                autoCapitalize="words"
                className="border border-gray-200 rounded-2xl px-4 py-4 text-[15px] text-[#111]"
              />
            </View>
          </View>

          {/* Phone Number */}
          <View>
            <Text className="text-[#111] text-[13px] font-semibold mb-2">Phone Number</Text>
            <View className="flex-row border border-gray-200 rounded-2xl overflow-hidden">
              <TouchableOpacity
                onPress={openSheet}
                className="flex-row items-center px-3 gap-1.5 border-r border-gray-200 bg-white"
                style={{ paddingVertical: 14 }}
              >
                <Text style={{ fontSize: 20 }}>{country.flag}</Text>
                <Feather name="chevron-down" size={13} color="#999" />
                <Text className="text-[#111] text-[14px] font-semibold">{country.code}</Text>
              </TouchableOpacity>
              <Text className="flex-1 px-4 py-4 text-[15px] text-[#111]">
                {(user?.phoneNumber ?? "").replace(/^\+966/, "")}
              </Text>
            </View>
          </View>

          {/* Email */}
          <View>
            <Text className="text-[#111] text-[13px] font-semibold mb-2">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="customer@example.com"
              placeholderTextColor="#bbb"
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-gray-200 rounded-2xl px-4 py-4 text-[15px] text-[#111]"
            />
          </View>
        </ScrollView>

        {/* Save */}
        <View className="px-5 pb-8 pt-2">
          <TouchableOpacity
            onPress={handleSave}
            disabled={isPending}
            className="rounded-2xl py-4 items-center justify-center"
            style={{ backgroundColor: canSave ? "#366150" : "#E5E7EB" }}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="font-bold text-[15px]" style={{ color: canSave ? "#fff" : "#9CA3AF" }}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Country bottom sheet */}
      <Modal visible={sheetVisible} transparent animationType="none">
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={closeSheet}>
          <Pressable onPress={() => {}}>
            <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
              {/* Sheet handle */}
              <View className="bg-white rounded-t-3xl pt-4 pb-2 px-5">
                <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-4" />
                <Text className="text-[#111] text-[16px] font-black mb-4">Select Country</Text>

                {/* Countries — same card style as profile settings */}
                <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
                  {COUNTRIES.map((c, i) => (
                    <TouchableOpacity
                      key={c.code}
                      onPress={() => { setCountry(c); closeSheet(); }}
                      activeOpacity={0.6}
                      className={`flex-row items-center px-4 py-4 ${i < COUNTRIES.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      <Text className="flex-1 text-[#222] text-[14px] font-semibold">{c.name}</Text>
                      <View className="flex-row items-center gap-2">
                        <Text style={{ fontSize: 18 }}>{c.flag}</Text>
                        {country.code === c.code
                          ? <Feather name="check-circle" size={18} color="#366150" />
                          : <Feather name="chevron-right" size={17} color="#CCC" />
                        }
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
