import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const FAQ_IDS = ["what", "allergies", "completed", "missed", "cancel", "closed"] as const;

export default function FAQScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F4F4F4]">
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-9 h-9 rounded-full bg-white border border-gray-100 items-center justify-center mr-3 shadow-sm shadow-black/5"
        >
          <Feather name="arrow-left" size={16} color="#111" />
        </TouchableOpacity>
        <Text className="text-[#111] text-[20px] font-black">{t("profile.faqs")}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 overflow-hidden">
          {FAQ_IDS.map((id, i) => (
            <View key={id} className={i < FAQ_IDS.length - 1 ? "border-b border-gray-100" : ""}>
              <TouchableOpacity
                onPress={() => toggle(i)}
                activeOpacity={0.6}
                className="flex-row items-center justify-between px-4 py-4"
              >
                <Text className="flex-1 text-[#222] text-[14px] font-semibold pr-3">{t(`faq.items.${id}.q`)}</Text>
                <Feather
                  name={openIndex === i ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#999"
                />
              </TouchableOpacity>
              {openIndex === i && (
                <View className="px-4 pb-4">
                  <Text className="text-gray-500 text-[13px] leading-5">{t(`faq.items.${id}.a`)}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
