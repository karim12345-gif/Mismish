import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { ALL_ALLERGENS } from "../../../constants/allergens";
import { useUserAllergies } from "../../../context/AllergyContext";
import { useUpdateAllergies } from "../../../hooks/useAllergies";
import { useAuth } from "../../../context/AuthContext";
import { ALLERGY_PENDING_KEY } from "../../../constants/storage";

export default function AllergiesScreen() {
  const navigation = useNavigation<any>();
  const { userAllergies, setUserAllergies } = useUserAllergies();
  const { mutate: saveAllergies } = useUpdateAllergies();
  const { isAuthenticated } = useAuth();

  const [selected, setSelected] = useState<string[]>(userAllergies ?? []);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSelected(userAllergies ?? []);
  }, [userAllergies]);

  const toggle = (id: string) => {
    setSaved(false);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setUserAllergies(selected);
    await AsyncStorage.setItem(ALLERGY_PENDING_KEY, JSON.stringify(selected));

    const finish = () => {
      Toast.show({
        type: "success",
        text1: "Preferences saved ✓",
        text2: `${selected.length} allergen${selected.length > 1 ? "s" : ""} saved`,
        visibilityTime: 2000,
        topOffset: 60,
      });
      setTimeout(() => navigation.goBack(), 300);
    };

    if (isAuthenticated) {
      saveAllergies(selected, { onSuccess: finish, onError: finish });
    } else {
      finish();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9F9F9]">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-9 h-9 rounded-full bg-white border border-gray-100 items-center justify-center mr-3 shadow-sm shadow-black/5"
        >
          <Feather name="arrow-left" size={16} color="#111" />
        </TouchableOpacity>
        <Text className="text-[#111] text-[20px] font-black">Food Allergies</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className="text-gray-400 text-[13px] font-medium mb-6 leading-5">
          We'll show a warning on any bag that contains these ingredients so you can decide before ordering.
        </Text>

        {/* Allergen chips */}
        <View className="flex-row flex-wrap gap-3 mb-8">
          {ALL_ALLERGENS.map((allergen) => {
            const active = selected.includes(allergen.id);
            return (
              <TouchableOpacity
                key={allergen.id}
                onPress={() => toggle(allergen.id)}
                activeOpacity={0.75}
                className="flex-row items-center px-4 py-3 rounded-2xl border-2"
                style={{
                  borderColor: active ? "#FF7F50" : "#E5E7EB",
                  backgroundColor: active ? "#FFF4F0" : "#fff",
                }}
              >
                <Text style={{ fontSize: 20, marginRight: 8 }}>{allergen.emoji}</Text>
                <Text
                  className="font-bold text-[14px]"
                  style={{ color: active ? "#FF7F50" : "#444" }}
                >
                  {allergen.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={selected.length === 0}
          activeOpacity={0.8}
          className="w-full h-14 rounded-2xl items-center justify-center"
          style={{
            backgroundColor: selected.length === 0 ? "#E5E7EB" : saved ? "#18C96D" : "#FF7F50",
          }}
        >
          <Text
            className="font-black text-[16px]"
            style={{ color: selected.length === 0 ? "#9CA3AF" : "#fff" }}
          >
            {saved
              ? "✓ Saved"
              : selected.length > 0
              ? `Save ${selected.length} Allergen${selected.length > 1 ? "s" : ""}`
              : "Select an allergen to save"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
