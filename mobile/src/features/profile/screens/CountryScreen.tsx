import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Country } from "./PersonalInfoScreen";

const COUNTRIES: Country[] = [
  { flag: "🇸🇦", name: "Saudi Arabia", code: "+966" },
];

export default function CountryScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { selected, onSelect } = route.params ?? {};

  const [search, setSearch] = useState("");

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search)
  );

  const handleSelect = (item: Country) => {
    onSelect?.(item);
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Feather name="chevron-left" size={26} color="#111" />
        </TouchableOpacity>
        <Text className="text-[#111] text-[17px] font-semibold">Country</Text>
      </View>

      {/* Search */}
      <View className="px-5 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-[#F4F4F4] rounded-2xl px-4 gap-2 h-11">
          <Feather name="search" size={16} color="#999" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search country..."
            placeholderTextColor="#bbb"
            className="flex-1 text-[14px] text-[#111]"
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.code}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelect(item)}
            className="flex-row items-center py-4 border-b border-gray-100"
          >
            <Text style={{ fontSize: 26 }} className="mr-4">{item.flag}</Text>
            <Text className="flex-1 text-[#111] text-[15px] font-semibold">{item.name}</Text>
            <Text className="text-gray-400 text-[14px] font-medium mr-3">{item.code}</Text>
            {selected?.code === item.code && (
              <Feather name="check-circle" size={18} color="#366150" />
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Feather name="globe" size={36} color="#ddd" />
            <Text className="text-gray-300 font-semibold mt-3">No countries found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
