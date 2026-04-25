import React from "react";
import { View, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";

export const HomeSearchBar = () => {
  return (
    <View className="px-5 py-2">
      <View className="flex-row items-center bg-[#F9F9F9] border border-[#E8E8E8] rounded-[20px] px-4 py-3.5">
        <Feather name="search" size={20} color="#366150" className="mr-2" />
        <TextInput
          placeholder="Search for stores or bags..."
          placeholderTextColor="#999"
          className="flex-1 text-[#333] text-sm font-medium"
        />
      </View>
    </View>
  );
};
