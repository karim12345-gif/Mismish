import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const { logout } = useAuth();
  const navigation = useNavigation();

  const handleReset = async () => {
    await AsyncStorage.removeItem("skipMismishInfoModal");
    logout();
  };
  return (
    <SafeAreaView className="flex-1 bg-[#F8F6F2]">
      <StatusBar barStyle="dark-content" backgroundColor="#F8F6F2" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-6">
        <TouchableOpacity className="flex-row items-center">
          <Feather name="chevron-left" size={24} color="#333" />
          <Text className="text-[#111] text-[18px] font-semibold ml-2">
            Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white p-2.5 rounded-full shadow-sm shadow-black/5 border border-gray-100 relative">
          <Feather name="bell" size={20} color="#366150" />
          <View className="absolute top-2 right-2.5 bg-[#FF7F50] w-2 h-2 rounded-full border border-white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Impact Section */}
        <View className="px-5 mb-10 mt-2">
          <Text className="text-center text-[18px] font-bold text-[#1A1A1A] mb-7">
            Your Impact
          </Text>
          <View className="flex-row justify-between">
            {/* Box 1 */}
            <View className="bg-[#F0F7F4] rounded-[16px] w-[31%] py-6 items-center justify-center">
              <Image
                source={require("../../../../assets/images/money.png")}
                className="w-8 h-8 mb-4 opacity-90"
                resizeMode="contain"
              />
              <Text className="text-[#366150] font-black text-[16px] mb-1.5">
                10
              </Text>
              <Text className="text-gray-500 text-[11px] font-semibold">
                SAR Saved
              </Text>
            </View>
            {/* Box 2 */}
            <View className="bg-[#F0F7F4] rounded-[16px] w-[31%] py-6 items-center justify-center">
              <Image
                source={require("../../../../assets/images/co.png")}
                className="w-8 h-8 mb-4 opacity-90"
                resizeMode="contain"
              />
              <Text className="text-[#366150] font-black text-[16px] mb-1.5">
                10
              </Text>
              <Text className="text-gray-500 text-[11px] font-semibold">
                Meals Rescued
              </Text>
            </View>
            {/* Box 3 */}
            <View className="bg-[#F0F7F4] rounded-[16px] w-[31%] py-6 items-center justify-center">
              <Image
                source={require("../../../../assets/images/enviroment.png")}
                className="w-8 h-8 mb-4 opacity-90"
                resizeMode="contain"
              />
              <Text className="text-[#366150] font-black text-[16px] mb-1.5">
                10
              </Text>
              <Text className="text-gray-500 text-[11px] font-semibold">
                CO₂ Reduced
              </Text>
            </View>
          </View>
        </View>

        {/* User Profile Section */}
        <View className="px-6 flex-row items-center mb-10">
          <View className="w-20 h-20 rounded-full bg-[#366150] items-center justify-center mr-5 shadow-sm shadow-black/10 border-2 border-white/50">
            <Text className="text-white text-2xl font-black tracking-wider">
              MU
            </Text>
          </View>
          <View>
            <Text className="text-[#1A1A1A] text-[20px] font-black">
              Muhammad Uzair
            </Text>
          </View>
        </View>

        {/* Settings Rows */}
        <View className="px-6 pb-20">
          <SettingRow
            icon={<Feather name="user" size={20} color="#366150" />}
            label="Personal Info"
          />
          <SettingRow
            icon={<Feather name="map-pin" size={20} color="#366150" />}
            label="Addresses"
          />
          <SettingRow
            icon={<Feather name="credit-card" size={20} color="#366150" />}
            label="Payment Method"
            onPress={() => navigation.navigate("AddNewCard" as never)}
          />

          <SettingRow
            icon={<Feather name="help-circle" size={20} color="#366150" />}
            label="FAQs"
          />
          <SettingRow
            icon={<Feather name="star" size={20} color="#366150" />}
            label="User Reviews"
          />
          <SettingRow
            icon={<Feather name="settings" size={20} color="#366150" />}
            label="Settings"
          />
          <SettingRow
            icon={<Feather name="refresh-cw" size={20} color="#FF7F50" />}
            label="Debug: Reset App State"
            hasBorder={false}
            onPress={handleReset}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const SettingRow = ({
  icon,
  label,
  hasBorder = true,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  hasBorder?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className={`flex-row items-center justify-between py-5 ${hasBorder ? "border-b border-gray-200/60" : ""}`}
  >
    <View className="flex-row items-center">
      <View className="w-8 items-start justify-center mr-2">{icon}</View>
      <Text className="text-[#222] text-[15px] font-semibold">{label}</Text>
    </View>
    <Feather name="chevron-right" size={20} color="#CCC" />
  </TouchableOpacity>
);
