import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ALL_ALLERGENS } from "../../constants/allergens";
import { useUserAllergies } from "../../context/AllergyContext";

interface AllergenInfoSheetProps {
  visible: boolean;
  onClose: () => void;
  allergens: string[];
  ingredients?: string[];
}

export const AllergenInfoSheet = ({
  visible,
  onClose,
  allergens,
  ingredients = [],
}: AllergenInfoSheetProps) => {
  const { userAllergies } = useUserAllergies();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}
        onPress={onClose}
      >
        <Pressable onPress={() => {}} style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          {/* Handle */}
          <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
            <View style={{ width: 36, height: 4, backgroundColor: "#E5E5E5", borderRadius: 2 }} />
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={{ fontSize: 17, fontWeight: "900", color: "#111", marginTop: 12, marginBottom: 20 }}>
              Ingredients & Allergens
            </Text>

            {/* Ingredients */}
            {ingredients.length > 0 && (
              <>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#BBB", letterSpacing: 0.8, marginBottom: 12 }}>
                  INGREDIENTS
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                  {ingredients.map((ing) => (
                    <View key={ing} style={{ backgroundColor: "#F5F5F5", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
                      <Text style={{ fontSize: 13, color: "#555", fontWeight: "500" }}>{ing}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Allergens */}
            {allergens.length > 0 && (
              <>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#BBB", letterSpacing: 0.8, marginBottom: 8 }}>
                  ALLERGENS
                </Text>
                {allergens.map((id, index) => {
                  const found = ALL_ALLERGENS.find((a) => a.id === id);
                  const isMatch = userAllergies.includes(id);
                  return (
                    <View
                      key={id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 13,
                        borderBottomWidth: index < allergens.length - 1 ? 1 : 0,
                        borderBottomColor: "#F0F0F0",
                      }}
                    >
                      <Text style={{ fontSize: 20, marginRight: 12, width: 28 }}>{found?.emoji ?? "⚠️"}</Text>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: "#111", flex: 1 }}>
                        {found?.label ?? id}
                      </Text>
                      {isMatch && (
                        <MaterialCommunityIcons name="alert-circle" size={18} color="#DC2626" />
                      )}
                    </View>
                  );
                })}
              </>
            )}
          </ScrollView>

          {/* Got it */}
          <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{ backgroundColor: "#FF7F50", borderRadius: 16, height: 52, alignItems: "center", justifyContent: "center" }}
              activeOpacity={0.85}
            >
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>Got it</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
