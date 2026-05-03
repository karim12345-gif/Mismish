import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export const HomeSearchBar = () => {
  const navigation = useNavigation<any>();

  return (
    <View className="px-5 py-2 bg-white">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("Search")}
        className="flex-row items-center bg-[#F9F9F9] border border-[#E8E8E8] rounded-[20px] px-4 py-3.5"
      >
        <Ionicons name="search" size={20} color="#FF7F50" className="mr-2" />
        <Text className="flex-1 text-[#aaa] text-sm font-medium ml-1">
          Search for restaurants or meals
        </Text>
      </TouchableOpacity>
    </View>
  );
};
