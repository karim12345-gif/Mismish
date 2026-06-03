import { useTranslation } from "react-i18next";
import { useAuth } from "../../../context/AuthContext";
import { InView } from "@components/Inview";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, I18nManager, ScrollView, Alert } from "react-native";
import { styled } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import { ALL_ALLERGENS } from "../../../constants/allergens";
import { useUserAllergies } from "../../../context/AllergyContext";
import { useUpdateAllergies } from "../../../hooks/useAllergies";
import { ALLERGY_PENDING_KEY } from "../../../components/AllergyOnboarding/AllergyOnboardingSheet";

const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);

const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const { logout, isAuthenticated } = useAuth();
  const { userAllergies, setUserAllergies } = useUserAllergies();
  const { mutate: saveAllergies } = useUpdateAllergies();

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

  const handleSaveAllergens = async () => {
    setUserAllergies(selected);
    await AsyncStorage.setItem(ALLERGY_PENDING_KEY, JSON.stringify(selected));
    if (isAuthenticated) {
      saveAllergies(selected, {
        onSuccess: () => setSaved(true),
        onError: () => Alert.alert("Error", "Could not save allergens. Try again."),
      });
    } else {
      setSaved(true);
    }
  };

  const changeLanguage = async (lang: "en" | "ar") => {
    await AsyncStorage.setItem("language", lang);
    await i18n.changeLanguage(lang);
    const isRTL = lang === "ar";
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      try {
        await Updates.reloadAsync();
      } catch (e) {
        console.warn("Please reload the app manually to apply RTL changes.");
      }
    }
  };

  return (
    <InView className="flex-1 bg-[#F9F9F9]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingTop: 80, paddingBottom: 60 }}>

        {/* Allergens */}
        <View className="mb-8">
          <StyledText className="text-[18px] font-black text-[#111] mb-1">
            Food Allergies 🥜
          </StyledText>
          <StyledText className="text-gray-400 text-[13px] font-medium mb-5">
            We'll warn you before ordering bags that contain these.
          </StyledText>

          <View className="flex-row flex-wrap gap-3">
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
                  <Text style={{ fontSize: 18, marginRight: 6 }}>{allergen.emoji}</Text>
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

          <TouchableOpacity
            onPress={handleSaveAllergens}
            className="mt-5 h-12 rounded-2xl items-center justify-center"
            style={{ backgroundColor: saved ? "#18C96D" : "#FF7F50" }}
          >
            <Text className="text-white font-black text-[15px]">
              {saved ? "✓ Saved" : selected.length > 0 ? `Save ${selected.length} Allergen${selected.length > 1 ? "s" : ""}` : "Save — No Allergies"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-200 mb-8" />

        {/* Language */}
        <View className="mb-8">
          <StyledText className="text-[18px] font-black text-[#111] mb-5">
            {t("settings.language")}
          </StyledText>

          <View className="flex-row gap-4">
            <StyledTouchable
              onPress={() => changeLanguage("en")}
              className={`flex-1 p-4 rounded-xl border-2 items-center flex-row justify-center gap-2 ${
                i18n.language === "en"
                  ? "border-[#FF7F50] bg-[#FFF4F0]"
                  : "border-gray-200 bg-white"
              }`}
            >
              <Text>🇺🇸</Text>
              <StyledText className={i18n.language === "en" ? "font-bold" : ""}>
                {t("settings.english")}
              </StyledText>
            </StyledTouchable>

            <StyledTouchable
              onPress={() => changeLanguage("ar")}
              className={`flex-1 p-4 rounded-xl border-2 items-center flex-row justify-center gap-2 ${
                i18n.language === "ar"
                  ? "border-[#FF7F50] bg-[#FFF4F0]"
                  : "border-gray-200 bg-white"
              }`}
            >
              <Text>🇸🇦</Text>
              <StyledText className={i18n.language === "ar" ? "font-bold" : ""}>
                {t("settings.arabic")}
              </StyledText>
            </StyledTouchable>
          </View>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-200 mb-8" />

        {/* Account */}
        <View className="gap-4">
          {!isAuthenticated ? (
            <StyledTouchable
              onPress={() => console.log("Sign In pressed")}
              className="w-full p-4 rounded-xl bg-[#146566] items-center"
            >
              <StyledText className="text-white font-bold">Sign In</StyledText>
            </StyledTouchable>
          ) : (
            <StyledTouchable
              onPress={logout}
              className="w-full p-4 rounded-xl bg-red-50 border border-red-200 items-center"
            >
              <StyledText className="text-red-600 font-bold">Logout</StyledText>
            </StyledTouchable>
          )}

          <StyledTouchable
            onPress={async () => {
              await AsyncStorage.removeItem("hasSeenIntro");
              await Updates.reloadAsync();
            }}
            className="w-full p-4 rounded-xl bg-gray-100 items-center"
          >
            <StyledText className="text-gray-600 font-bold">
              Reset Onboarding (Debug)
            </StyledText>
          </StyledTouchable>
        </View>

      </ScrollView>
    </InView>
  );
};

export default SettingsScreen;
