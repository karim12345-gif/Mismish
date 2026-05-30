import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ALL_ALLERGENS } from "../../constants/allergens";
import { useUpdateAllergies } from "../../hooks/useAllergies";
import { useAuth } from "../../context/AuthContext";
import { useUserAllergies } from "../../context/AllergyContext";

export const ALLERGY_ONBOARDED_KEY = "@mismish_allergy_onboarded";
export const ALLERGY_PENDING_KEY = "@mismish_pending_allergies";

interface Props {
  visible: boolean;
  onDone: () => void;
}

export const AllergyOnboardingSheet = ({ visible, onDone }: Props) => {
  const [selected, setSelected] = useState<string[]>([]);
  const { mutate: saveAllergies } = useUpdateAllergies();
  const { isAuthenticated } = useAuth();
  const { setUserAllergies } = useUserAllergies();

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    await AsyncStorage.setItem(ALLERGY_ONBOARDED_KEY, "true");

    if (selected.length > 0) {
      await AsyncStorage.setItem(ALLERGY_PENDING_KEY, JSON.stringify(selected));
      // Update context immediately — cards re-render with warnings right away
      setUserAllergies(selected);

      if (isAuthenticated) {
        saveAllergies(selected, { onSuccess: onDone, onError: onDone });
      } else {
        onDone();
      }
    } else {
      onDone();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
        onPress={handleSave}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10">
            {/* Handle */}
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            {/* Header */}
            <Text className="text-[#111] font-black text-[22px] mb-1">
              Any food allergies? 🥜
            </Text>
            <Text className="text-gray-500 font-medium text-[14px] mb-6 leading-5">
              We'll warn you before you order a bag that may contain these ingredients.
            </Text>

            {/* Allergen grid */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 260 }}
            >
              <View className="flex-row flex-wrap gap-3 mb-6">
                {ALL_ALLERGENS.map((allergen) => {
                  const active = selected.includes(allergen.id);
                  return (
                    <TouchableOpacity
                      key={allergen.id}
                      onPress={() => toggle(allergen.id)}
                      activeOpacity={0.75}
                      className="flex-row items-center px-4 py-2.5 rounded-2xl border-2"
                      style={{
                        borderColor: active ? "#FF7F50" : "#E5E7EB",
                        backgroundColor: active ? "#FFF4F0" : "#fff",
                      }}
                    >
                      <Text style={{ fontSize: 20, marginRight: 8 }}>{allergen.emoji}</Text>
                      <Text
                        className="font-bold text-[13px]"
                        style={{ color: active ? "#FF7F50" : "#444" }}
                      >
                        {allergen.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Save button */}
            <TouchableOpacity
              onPress={handleSave}
              className="w-full h-14 rounded-2xl items-center justify-center mb-3"
              style={{ backgroundColor: "#FF7F50" }}
            >
              <Text className="text-white font-black text-[16px]">
                {selected.length > 0
                  ? `Save ${selected.length} Allergen${selected.length > 1 ? "s" : ""}`
                  : "No Allergies"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSave} className="items-center py-2">
              <Text className="text-gray-400 font-semibold text-[13px]">
                Skip for now
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
