import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const HomeHeroBanner = () => {
  return (
    <View className="px-5 py-4">
      <View className="bg-[#1B4332] rounded-[24px] p-6 relative overflow-hidden shadow-md shadow-[#1B433250]">
        {/* Background faded gift icon decoration */}
        <View className="absolute right-[-20px] bottom-[-20px] opacity-10">
          <MaterialCommunityIcons name="gift" size={140} color="#ffffff" />
        </View>

        {/* Content */}
        <View className="z-10 w-3/4">
          <Text className="text-white font-black text-xl mb-3 leading-tight tracking-tight shadow-sm shadow-black/10">
            Rescue Food, Earn Rewards
          </Text>

          <Text className="text-white text-[13px] font-semibold opacity-90 leading-snug mb-5 shadow-sm shadow-black/10">
            Complete 3 rescues this week for a 50% cashback voucher.
          </Text>

          <TouchableOpacity className="bg-white/20 px-4 py-1.5 rounded-full self-start border border-white/60">
            <Text className="text-white text-xs font-black tracking-widest leading-none">
              Learn More
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
