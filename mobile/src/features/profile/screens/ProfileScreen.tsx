import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  RefreshControl,
  Image,
  ActivityIndicator,
  Modal,
  Pressable,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useImpactStats } from "../../../hooks/useImpactStats";
import { GuestAuthModal } from "../../../components/GuestAuthModal";

function getReferralCode(userId?: number | null): string {
  if (!userId) return "MSMSH0";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  let n = userId * 31 + 7;
  for (let i = 0; i < 6; i++) {
    code += chars[n % chars.length];
    n = Math.floor(n / chars.length) + (i + 1) * 13;
  }
  return code;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const { data: stats, isLoading: statsLoading, refetch } = useImpactStats();

  const [selectedCountry, setSelectedCountry] = useState({ flag: "🇸🇦", name: "Saudi Arabia", code: "+966" });
  const [countrySheet, setCountrySheet] = useState(false);
  const [logoutSheet, setLogoutSheet] = useState(false);
  const [languageSheet, setLanguageSheet] = useState(false);
  const [signInVisible, setSignInVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;
  const logoutSlideAnim = useRef(new Animated.Value(400)).current;
  const languageSlideAnim = useRef(new Animated.Value(400)).current;

  const openCountrySheet = () => {
    setCountrySheet(true);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 18 }).start();
  };
  const closeCountrySheet = () => {
    Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: true }).start(() => setCountrySheet(false));
  };

  const openLogoutSheet = () => {
    setLogoutSheet(true);
    Animated.spring(logoutSlideAnim, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 18 }).start();
  };
  const closeLogoutSheet = () => {
    Animated.timing(logoutSlideAnim, { toValue: 400, duration: 200, useNativeDriver: true }).start(() => setLogoutSheet(false));
  };

  const openLanguageSheet = () => {
    setLanguageSheet(true);
    Animated.spring(languageSlideAnim, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 18 }).start();
  };
  const closeLanguageSheet = () => {
    Animated.timing(languageSlideAnim, { toValue: 400, duration: 200, useNativeDriver: true }).start(() => setLanguageSheet(false));
  };

  const referralCode = getReferralCode(user?.id);
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "ME";

  const handleReset = async () => {
    await AsyncStorage.removeItem("skipMismishInfoModal");
    logout();
  };

  const handleShare = async () => {
    await Share.share({
      message: `Use my code ${referralCode} on Mismish to rescue food and save money! 🌱`,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F4F4F4]">
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <Text className="text-[#111] text-[22px] font-black">Account</Text>
        <TouchableOpacity className="bg-white w-10 h-10 rounded-full items-center justify-center shadow-sm shadow-black/5 border border-gray-100">
          <Feather name="bell" size={18} color="#366150" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={statsLoading} onRefresh={refetch} tintColor="#366150" />
        }
      >
        {/* User Card */}
        {user?.name ? (
          <View className="mx-5 mb-5">
            <View className="bg-white rounded-2xl px-4 py-4 flex-row items-center border border-gray-100 shadow-sm shadow-black/5">
              <View className="w-12 h-12 rounded-full bg-[#366150] items-center justify-center mr-3">
                <Text className="text-white text-[16px] font-black">{initials}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[#111] text-[16px] font-black">{user.name}</Text>
                <Text className="text-gray-400 text-[12px] font-medium mt-0.5" numberOfLines={1}>
                  {user.phoneNumber ?? user.email ?? ""}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Impact Stats */}
        {user?.isVerified && (
          <View className="mx-5 mb-5">
            <Text className="text-[#111] text-[11px] font-bold uppercase tracking-widest mb-3 opacity-40">Your Impact</Text>
            <View className="flex-row gap-2">
              {[
                { img: require("../../../../assets/images/money.png"), value: stats?.sarSaved ?? 0, label: "SAR Saved" },
                { img: require("../../../../assets/images/co.png"), value: stats?.mealsRescued ?? 0, label: "Meals Rescued" },
                { img: require("../../../../assets/images/enviroment.png"), value: stats?.co2Reduced ?? 0, label: "CO₂ kg" },
              ].map(({ img, value, label }) => (
                <View key={label} className="flex-1 bg-white rounded-2xl py-4 items-center border border-gray-100 shadow-sm shadow-black/5">
                  <Image source={img} className="w-6 h-6 mb-2" resizeMode="contain" />
                  {statsLoading ? (
                    <ActivityIndicator size="small" color="#366150" />
                  ) : (
                    <>
                      <Text className="text-[#366150] font-black text-[16px]">{value}</Text>
                      <Text className="text-gray-400 text-[9px] font-bold uppercase tracking-wider mt-0.5 text-center px-1">{label}</Text>
                    </>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Referral Card — only shown once profile is complete */}
        {user?.name && <View className="mx-5 mb-5">
          <Text className="text-[#111] text-[11px] font-bold uppercase tracking-widest mb-3 opacity-40">Invite Friends</Text>
          <View className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 overflow-hidden">
            <View className="bg-[#366150] px-5 py-4">
              <Text className="text-white font-black text-[15px] mb-0.5">Invite friends, earn rewards 🎁</Text>
              <Text className="text-white/70 text-[12px] font-medium">
                Share your code — both of you get a bonus on the first rescue.
              </Text>
            </View>
            <View className="px-4 py-4">
              <View className="flex-row items-center bg-[#F4F4F4] rounded-xl px-4 py-3 mb-3">
                <View className="flex-1">
                  <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Your code</Text>
                  <Text className="text-[#111] text-[18px] font-black tracking-widest">{referralCode}</Text>
                </View>
                <TouchableOpacity
                  onPress={handleShare}
                  className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg"
                >
                  <Text className="text-[#366150] text-[12px] font-bold">Share</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleShare}
                className="bg-[#FF7F50] h-11 rounded-xl flex-row items-center justify-center gap-2"
              >
                <Feather name="share-2" size={14} color="#fff" />
                <Text className="text-white font-bold text-[14px]">Share with Friends</Text>
              </TouchableOpacity>

              <View className="flex-row mt-4 pt-4 border-t border-gray-100">
                {[["0", "Invited"], ["0", "Joined"], ["﷼ 0", "Earned"]].map(([val, label], i, arr) => (
                  <React.Fragment key={label}>
                    <View className="flex-1 items-center">
                      <Text className="text-[#111] text-[17px] font-black">{val}</Text>
                      <Text className="text-gray-400 text-[11px] font-medium mt-0.5">{label}</Text>
                    </View>
                    {i < arr.length - 1 && <View className="w-[1px] bg-gray-100" />}
                  </React.Fragment>
                ))}
              </View>
            </View>
          </View>
        </View>}

        {/* Account section */}
        <View className="mx-5 mb-5">
          <Text className="text-[#111] text-[11px] font-bold uppercase tracking-widest mb-3 opacity-40">Account</Text>
          <View className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 overflow-hidden">
            {user?.isVerified ? (
              <>
                <SettingRow icon="user" label="Personal Info" onPress={() => navigation.navigate("PersonalInfo")} />
                <SettingRow icon="credit-card" label="Payment Method" onPress={() => navigation.navigate("PaymentMethod")} />
                <SettingRow icon="globe" label="Country" badge={selectedCountry.flag} onPress={openCountrySheet} />
              </>
            ) : (
              <SettingRow icon="log-in" label="Sign In" onPress={() => setSignInVisible(true)} />
            )}
            <SettingRow mciIcon="food-variant" label="Food Allergies" onPress={() => navigation.navigate("Allergies")} />
            <SettingRow icon="globe" label="Language" badge="🇺🇸" onPress={openLanguageSheet} isLast />
          </View>
        </View>

        {/* Help section */}
        <View className="mx-5 mb-5">
          <Text className="text-[#111] text-[11px] font-bold uppercase tracking-widest mb-3 opacity-40">Help</Text>
          <View className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 overflow-hidden">
            <SettingRow icon="help-circle" label="FAQs" onPress={() => navigation.navigate("FAQ")} />
            <SettingRow icon="settings" label="Settings" onPress={() => navigation.navigate("Settings")} />
            <SettingRow icon="file-text" label="Terms and Conditions" isLast />
          </View>
        </View>

        {/* Logout — only shown after phone + OTP verified */}
        {user?.isVerified && (
          <View className="mx-5 mb-4">
            <TouchableOpacity
              onPress={openLogoutSheet}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 py-4 flex-row items-center justify-center gap-2"
            >
              <Feather name="log-out" size={15} color="#366150" />
              <Text className="text-[#366150] font-bold text-[14px]">Log Out</Text>
            </TouchableOpacity>
          </View>
        )}

        {__DEV__ && (
          <View className="mx-5 mb-10">
            <TouchableOpacity
              onPress={handleReset}
              className="border border-dashed border-gray-300 rounded-2xl py-3 flex-row items-center justify-center gap-2"
            >
              <Feather name="refresh-cw" size={13} color="#bbb" />
              <Text className="text-gray-300 font-bold text-[11px]">DEV: Reset App State</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <GuestAuthModal
        visible={signInVisible}
        onClose={() => setSignInVisible(false)}
        onLoginSuccess={() => setSignInVisible(false)}
      />

      {/* Logout confirmation sheet */}
      <Modal visible={logoutSheet} transparent animationType="none">
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={closeLogoutSheet}>
          <Pressable onPress={() => {}}>
            <Animated.View style={{ transform: [{ translateY: logoutSlideAnim }] }}>
              <View className="bg-white rounded-t-3xl px-5 pt-6 pb-10">
                <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-6" />
                {/* Icon */}
                <View className="w-16 h-16 rounded-full bg-[#E8F0ED] items-center justify-center self-center mb-4">
                  <Feather name="log-out" size={28} color="#366150" />
                </View>
                <Text className="text-[#111] text-[18px] font-black text-center mb-2">Logout</Text>
                <Text className="text-gray-400 text-[13px] font-medium text-center mb-8">
                  Are you sure you want to logout?
                </Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={closeLogoutSheet}
                    className="flex-1 h-12 rounded-2xl items-center justify-center bg-[#F4F4F4]"
                  >
                    <Text className="text-[#111] font-bold text-[14px]">No</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { closeLogoutSheet(); setTimeout(logout, 220); }}
                    className="flex-1 h-12 rounded-2xl items-center justify-center bg-[#366150]"
                  >
                    <Text className="text-white font-bold text-[14px]">Yes, Logout</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Language bottom sheet */}
      <Modal visible={languageSheet} transparent animationType="none">
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={closeLanguageSheet}>
          <Pressable onPress={() => {}}>
            <Animated.View style={{ transform: [{ translateY: languageSlideAnim }] }}>
              <View className="bg-white rounded-t-3xl px-5 pt-4 pb-10">
                <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-4" />
                <Text className="text-[#111] text-[16px] font-black mb-4">Language</Text>
                <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  {[
                    { flag: "🇺🇸", label: "English", value: "en" },
                    { flag: "🇸🇦", label: "Arabic", value: "ar" },
                  ].map((lang, i, arr) => (
                    <TouchableOpacity
                      key={lang.value}
                      onPress={closeLanguageSheet}
                      activeOpacity={0.6}
                      className={`flex-row items-center px-4 py-4 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      <Text style={{ fontSize: 20, marginRight: 12 }}>{lang.flag}</Text>
                      <Text className="flex-1 text-[#222] text-[14px] font-semibold">{lang.label}</Text>
                      <Feather name="chevron-right" size={17} color="#CCC" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Country bottom sheet */}
      <Modal visible={countrySheet} transparent animationType="none">
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={closeCountrySheet}>
          <Pressable onPress={() => {}}>
            <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
              <View className="bg-white rounded-t-3xl px-5 pt-4 pb-10">
                <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-4" />
                <Text className="text-[#111] text-[16px] font-black mb-4">Select Country</Text>
                <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  {[{ flag: "🇸🇦", name: "Saudi Arabia", code: "+966" }].map((c, i, arr) => (
                    <TouchableOpacity
                      key={c.code}
                      onPress={() => { setSelectedCountry(c); closeCountrySheet(); }}
                      activeOpacity={0.6}
                      className={`flex-row items-center px-4 py-4 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      <Text className="flex-1 text-[#222] text-[14px] font-semibold">{c.name}</Text>
                      <View className="flex-row items-center gap-2">
                        <Text style={{ fontSize: 18 }}>{c.flag}</Text>
                        {selectedCountry.code === c.code
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

function SettingRow({
  icon,
  mciIcon,
  label,
  onPress,
  isLast,
  badge,
}: {
  icon?: React.ComponentProps<typeof Feather>["name"];
  mciIcon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  onPress?: () => void;
  isLast?: boolean;
  badge?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      className={`flex-row items-center justify-between px-4 py-4 ${isLast ? "" : "border-b border-gray-100"}`}
    >
      <View className="flex-row items-center gap-3">
        <View className="w-8 h-8 rounded-xl bg-[#F4F4F4] items-center justify-center">
          {mciIcon
            ? <MaterialCommunityIcons name={mciIcon} size={17} color="#366150" />
            : <Feather name={icon!} size={15} color="#366150" />
          }
        </View>
        <Text className="text-[#222] text-[14px] font-semibold">{label}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        {badge && <Text className="text-[18px]">{badge}</Text>}
        <Feather name="chevron-right" size={17} color="#CCC" />
      </View>
    </TouchableOpacity>
  );
}
