import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ALL_ALLERGENS } from "../../constants/allergens";
import { useAllergies, useUpdateAllergies } from "../../hooks/useAllergies";
import { useAuth } from "../../context/AuthContext";

export default function AllergyOnboardingScreen() {
  const { data: existingAllergies } = useAllergies();
  const [selected, setSelected] = useState<string[]>([]);
  const { mutate: saveAllergies, isPending } = useUpdateAllergies();
  const { completeAllergyOnboarding } = useAuth();

  // Pre-fill with any allergies already saved on the account
  useEffect(() => {
    if (existingAllergies && existingAllergies.length > 0) {
      setSelected(existingAllergies);
    }
  }, [existingAllergies]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const handleSave = () => {
    if (selected.length > 0) {
      saveAllergies(selected, {
        onSuccess: completeAllergyOnboarding,
        onError: completeAllergyOnboarding,
      });
    } else {
      completeAllergyOnboarding();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-10 pb-8">
          {/* Header */}
          <Text className="text-[#111] font-black text-[30px] mb-2 leading-tight">
            Any food allergies? 🥜
          </Text>
          <Text className="text-gray-500 font-medium text-[15px] mb-8 leading-6">
            We'll warn you before you order a bag that may contain these
            ingredients.
          </Text>

          {/* Allergen grid */}
          <View className="flex-row flex-wrap gap-3 mb-10">
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
                    backgroundColor: active ? "#FFF4F0" : "#FAFAFA",
                  }}
                >
                  <Text style={{ fontSize: 22, marginRight: 8 }}>
                    {allergen.emoji}
                  </Text>
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

          {/* Selection hint */}
          {selected.length > 0 && (
            <View className="bg-[#FFF4F0] rounded-2xl px-4 py-3 mb-6 flex-row items-center">
              <Text className="text-[#FF7F50] font-black text-[13px] mr-1">
                {selected.length}
              </Text>
              <Text className="text-[#FF7F50] font-semibold text-[13px]">
                {selected.length === 1 ? "allergen" : "allergens"} selected —
                we'll warn you on every bag.
              </Text>
            </View>
          )}

          {/* Buttons */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isPending}
            className="w-full h-14 rounded-2xl items-center justify-center mb-3"
            style={{ backgroundColor: "#FF7F50", opacity: isPending ? 0.6 : 1 }}
          >
            <Text className="text-white font-black text-[16px]">
              {selected.length > 0
                ? `Save ${selected.length} Allergen${selected.length > 1 ? "s" : ""}`
                : "I have no allergies"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={completeAllergyOnboarding}
            className="items-center py-3"
          >
            <Text className="text-gray-400 font-semibold text-[14px]">
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
