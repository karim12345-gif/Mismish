import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import { DevSettings, I18nManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";

import en from "./locales/en.json";
import ar from "./locales/ar.json";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

export type SupportedLanguage = keyof typeof resources;

export const setAppLanguage = async (language: SupportedLanguage) => {
  const isRTL = language === "ar";
  const directionChanged = I18nManager.isRTL !== isRTL;

  await AsyncStorage.setItem("language", language);
  await i18n.changeLanguage(language);
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);

  if (!directionChanged) return;

  if (__DEV__) {
    DevSettings.reload();
    return;
  }

  try {
    await Updates.reloadAsync();
  } catch {
    // Text still updates immediately; RTL applies on the next app launch.
  }
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem("language");

  if (!savedLanguage) {
    const locales = getLocales();
    savedLanguage = locales[0]?.languageCode ?? "en";
  }

  // Fallback if system language isn't supported
  if (savedLanguage !== "ar" && savedLanguage !== "en") {
    savedLanguage = "en";
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

  // Handle RTL
  const isRTL = i18n.language === "ar";
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    // In a real app with updates, we might need to restart,
    // but Expo Go handles it gracefully usually or via Reload.
  }
};

initI18n();

export default i18n;
