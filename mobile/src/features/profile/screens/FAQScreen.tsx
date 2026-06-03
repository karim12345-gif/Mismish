import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const FAQS = [
  {
    q: "What is Mismish?",
    a: "Mismish is a food rescue app that connects you with restaurants and cafes selling surplus food at discounted prices — saving you money and reducing waste.",
  },
  {
    q: "I am allergic to some of the food",
    a: "You can set your food allergies in the Account tab under Food Allergies. We'll display a warning on any bag that contains those ingredients.",
  },
  {
    q: "How do I know if my order was completed?",
    a: "You'll receive a push notification and can also check your order status in the Orders tab.",
  },
  {
    q: "I missed my collection time",
    a: "If you miss your collection window, the order is unfortunately considered completed and no refund is issued. Please make sure to collect within the time shown on the bag.",
  },
  {
    q: "How can I cancel my order?",
    a: "Orders can be cancelled before the collection window starts. Go to the Orders tab, select the order, and tap Cancel.",
  },
  {
    q: "The store was closed at collection time",
    a: "If a store is unexpectedly closed during your collection window, contact us through the Help section and we'll sort it out for you.",
  },
];

export default function FAQScreen() {
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
        <Text className="text-[#111] text-[20px] font-black">FAQs</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 overflow-hidden">
          {FAQS.map((item, i) => (
            <View key={i} className={i < FAQS.length - 1 ? "border-b border-gray-100" : ""}>
              <TouchableOpacity
                onPress={() => toggle(i)}
                activeOpacity={0.6}
                className="flex-row items-center justify-between px-4 py-4"
              >
                <Text className="flex-1 text-[#222] text-[14px] font-semibold pr-3">{item.q}</Text>
                <Feather
                  name={openIndex === i ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#999"
                />
              </TouchableOpacity>
              {openIndex === i && (
                <View className="px-4 pb-4">
                  <Text className="text-gray-500 text-[13px] leading-5">{item.a}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
