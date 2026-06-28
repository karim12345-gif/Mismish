import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function WalletScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-4 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
        >
          <Feather name="chevron-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text className="text-[17px] font-bold text-[#111]">My Wallet</Text>
        <TouchableOpacity className="p-2 -mr-2">
          <Feather name="more-vertical" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Coral Balance Card */}
        <View className="bg-[#F26C4F] rounded-[20px] p-6 shadow-sm shadow-[#F26C4F]/30 relative overflow-hidden">
          {/* Logo Right */}
          <View className="absolute top-5 right-5 flex-row items-center">
            <Ionicons name="flash" size={16} color="#FFF" />
            <Text className="text-white font-black text-sm ml-1 tracking-tight">
              MishMish
            </Text>
          </View>

          <Text className="text-white/90 font-medium text-[13px] mb-1">
            Total Balance
          </Text>
          <View className="flex-row items-end mb-6">
            <Text className="text-white font-black text-[34px] tracking-tight leading-none">
              0.00
            </Text>
            <Text className="text-white/80 font-bold text-[14px] ml-1.5 mb-1.5">
              SAR
            </Text>
          </View>

          <View className="items-end">
            <TouchableOpacity className="flex-row items-center bg-white/20 rounded-full px-4 py-2">
              <Feather name="plus" size={16} color="#FFF" />
              <Text className="text-white font-bold text-[13px] ml-1.5">
                Add Credit
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transactions Toggles */}
        <Text className="font-extrabold text-[18px] text-[#111] mt-8 mb-4">
          Wallet Transactions
        </Text>
        <View className="flex-row items-center space-x-3 mb-16">
          <TouchableOpacity className="border border-[#F26C4F] bg-white rounded-full px-5 py-2 mr-3">
            <Text className="text-[#F26C4F] font-semibold text-[13px]">
              All Transactions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="border border-[#111] bg-white rounded-full px-5 py-2 mr-3">
            <Text className="text-[#111] font-semibold text-[13px]">
              Credit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="border border-[#111] bg-white rounded-full px-5 py-2">
            <Text className="text-[#111] font-semibold text-[13px]">Debit</Text>
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        <View className="items-center justify-center mt-6 mb-16">
          {/* Custom Illustration placeholder mapped from standard icons */}
          <View className="relative w-32 h-24 items-center justify-center mb-8">
            <View className="w-20 h-14 bg-gray-100 rounded-lg absolute -rotate-12 transform shadow-sm shadow-black/5" />
            <View className="w-20 h-14 bg-white rounded-lg absolute border border-gray-100 shadow-sm shadow-black/5 flex-row items-center justify-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-gray-300" />
              <View className="w-2 h-2 rounded-full bg-gray-300" />
              <View className="w-2 h-2 rounded-full bg-gray-300" />
            </View>
            <View className="absolute top-1 right-2 w-6 h-6 bg-[#F26C4F] rounded-full items-center justify-center border-2 border-white">
              <MaterialCommunityIcons name="history" size={14} color="#FFF" />
            </View>
          </View>

          <Text className="text-[18px] font-black text-[#111] mb-3">
            No Transactions Yet
          </Text>
          <Text className="text-[#666] font-medium text-[13px] text-center leading-5 px-6">
            Start saving on delicious food to see your wallet activity here.
          </Text>
        </View>

        {/* Info Banner */}
        <View className="border-t border-gray-100 pt-6 pb-20">
          <View className="bg-[#E6F3EE] rounded-[16px] flex-row p-4 pt-5 items-start">
            <View className="w-8 h-8 rounded-full border border-[#366150]/30 items-center justify-center mr-3 mt-1">
              <Feather name="info" size={16} color="#366150" />
            </View>
            <View className="flex-1 pr-6">
              <Text className="text-[#366150] font-bold text-[13px] mb-1">
                How credits work?
              </Text>
              <Text className="text-gray-600 font-medium text-[11px] leading-4 pb-2">
                MishMish credits can be used to book surprises instantly.
                Credits never expire and are non-refundable.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity className="absolute bottom-10 right-6 w-14 h-14 rounded-full bg-[#366150] items-center justify-center shadow-md shadow-black/20">
        <MaterialCommunityIcons name="currency-rial" size={24} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
