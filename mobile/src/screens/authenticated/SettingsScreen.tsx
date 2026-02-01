import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { InView } from "@components/Inview";
import React from "react";
import { Text, TouchableOpacity, View, I18nManager } from "react-native";
import { styled } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);

const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();

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
    <InView className="p-6 justify-start pt-20">
      <StyledText className="text-3xl font-bold text-[#146566] mb-8 text-center">
        {t("settings.title")}
      </StyledText>

      <View className="mb-8">
        <StyledText className="text-xl font-semibold mb-4 text-gray-700 text-left">
          {t("settings.language")}
        </StyledText>

        <View className="flex-row gap-4">
          <StyledTouchable
            onPress={() => changeLanguage("en")}
            className={`flex-1 p-4 rounded-xl border-2 items-center flex-row justify-center gap-2 ${i18n.language === "en" ? "border-[#F59E0B] bg-[#FFF8E1]" : "border-gray-200 bg-white"}`}
          >
            <Text>🇺🇸</Text>
            <StyledText className={i18n.language === "en" ? "font-bold" : ""}>
              {t("settings.english")}
            </StyledText>
          </StyledTouchable>

          <StyledTouchable
            onPress={() => changeLanguage("ar")}
            className={`flex-1 p-4 rounded-xl border-2 items-center flex-row justify-center gap-2 ${i18n.language === "ar" ? "border-[#F59E0B] bg-[#FFF8E1]" : "border-gray-200 bg-white"}`}
          >
            <Text>🇸🇦</Text>
            <StyledText className={i18n.language === "ar" ? "font-bold" : ""}>
              {t("settings.arabic")}
            </StyledText>
          </StyledTouchable>
        </View>
      </View>

      <View className="mt-auto mb-8">
        <StyledTouchable
          onPress={logout}
          className="w-full p-4 rounded-xl bg-red-50 border border-red-200 items-center"
        >
          <StyledText className="text-red-600 font-bold">Logout</StyledText>
        </StyledTouchable>
      </View>
    </InView>
  );
};

export default SettingsScreen;
