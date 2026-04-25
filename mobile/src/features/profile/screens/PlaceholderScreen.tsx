import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlaceholderScreen({ route }: any) {
  return (
    <SafeAreaView className="flex-1 bg-[#F9F9F9]">
      <View className="flex-1 items-center justify-center">
        <Text className="text-[#366150] text-3xl font-black mb-2">
          {route.name}
        </Text>
        <Text className="text-[#888] font-semibold text-center mt-2 px-10">
          This feature is currently under development. Please check back later!
        </Text>
      </View>
    </SafeAreaView>
  );
}
