import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  useWindowDimensions,
  ViewToken,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { styled } from "nativewind";
import { useTranslation } from "react-i18next";

import {
  ONBOARDING_SLIDES,
  TOTAL_STEPS,
  LAST_STEP_INDEX,
} from "./onboarding.constants";
import { Props, Slide } from "./types";
import { useAuth } from "../../../context/AuthContext";

const StyledText = styled(Text);

// ─────────────────────────────────────────────
// Slide 1 — Welcome / Find stores near you
// Map pin + location dots
// ─────────────────────────────────────────────
export const WelcomeIllustration = () => (
  <View className="relative items-center justify-center">
    {/* Main Icon Container - No Drop shadow */}
    <View className="bg-white rounded-[60px] items-center justify-center z-10 w-[240px] h-[240px] shadow-sm shadow-black/5">
      <View className="relative w-32 h-32 items-center justify-center">
        {/* Main Icon */}
        <Image
          source={require("@assets/images/map.png")}
          className="w-[100px] h-[100px]"
          resizeMode="contain"
        />
        {/* Decoration Element */}
        <Image
          source={require("@assets/images/Container.png")}
          className="w-12 h-12 absolute -top-4 -right-1"
          resizeMode="contain"
        />
      </View>
    </View>
  </View>
);

// ─────────────────────────────────────────────
// Slide 2 — Surprise Bag
// Mystery bag with food items peeking out
// ─────────────────────────────────────────────
export const SurpriseIllustration = () => (
  <View className="relative items-center justify-center">
    {/* Rotated organic background */}
    <View
      className="absolute bg-[#FFF1E8] rounded-[64px]"
      style={{
        width: 280,
        height: 280,
        transform: [{ rotate: "-6deg" }],
        zIndex: -1,
      }}
    />

    <View className="w-[240px] h-[240px] bg-white rounded-[60px] items-center justify-center overflow-hidden shadow-sm shadow-black/5 z-10">
      {/* Warm blob */}
      <View
        className="absolute bg-[#FFF1E8] rounded-full"
        style={{ width: 200, height: 200, bottom: -60, right: -60 }}
      />

      <View className="items-center z-10">
        {/* Food items peeking out of bag */}
        <View className="flex-row gap-2 mb-1">
          <View className="w-10 h-10 bg-[#F5C842] rounded-full items-center justify-center">
            <Text style={{ fontSize: 20 }}>🥐</Text>
          </View>
          <View className="w-10 h-10 bg-[#E8A87C] rounded-full items-center justify-center">
            <Text style={{ fontSize: 20 }}>🍩</Text>
          </View>
          <View className="w-10 h-10 bg-[#A8D5A2] rounded-full items-center justify-center">
            <Text style={{ fontSize: 20 }}>🥗</Text>
          </View>
        </View>

        {/* Bag */}
        <View className="w-24 h-24 bg-[#366150] rounded-[28px] items-center justify-center shadow-lg shadow-[#36615050]">
          <Feather name="shopping-bag" size={44} color="#fff" />
        </View>

        {/* Discount badge */}
        <View className="bg-[#FF7F50] rounded-full px-4 py-1 mt-3">
          <Text className="text-white text-xs font-extrabold tracking-wider">
            UP TO 70% OFF
          </Text>
        </View>
      </View>

      {/* Question mark decoration */}
      <View className="absolute top-5 right-5 w-8 h-8 bg-[#FFF1E8] rounded-full items-center justify-center">
        <Text className="text-[#FF7F50] font-black text-base">?</Text>
      </View>
    </View>
  </View>
);

// ─────────────────────────────────────────────
// Slide 3 — Book & Collect (QR)
// Already implemented in original code — keeping exact same structure
// ─────────────────────────────────────────────
export const BookingIllustration = () => (
  <View className="relative items-center justify-center">
    {/* Arrow badge top left */}
    <View className="absolute -top-6 -left-6 bg-white w-14 h-14 rounded-full items-center justify-center z-20 shadow-sm shadow-[#00000020]">
      <Feather name="arrow-up-right" size={24} color="#FF7F50" />
    </View>

    {/* Main card */}
    <View className="w-[240px] h-[240px] bg-white rounded-[60px] items-center justify-center overflow-hidden shadow-sm shadow-black/5 z-10">
      {/* Green blob */}
      <View
        className="absolute bg-[#618671] rounded-full opacity-80"
        style={{ width: 200, height: 200, bottom: -60, left: -60 }}
      />

      {/* Ready badge */}
      <View className="absolute top-5 right-5 flex-row items-center gap-1 z-10">
        <View className="w-5 h-5 rounded-full border-2 border-[#1A1A1A] items-center justify-center">
          <Feather name="check" size={10} color="#1A1A1A" />
        </View>
        <Text className="text-[11px] font-black text-[#1A1A1A] tracking-widest">
          READY
        </Text>
      </View>

      {/* Glass inner card with QR */}
      <View
        className="w-36 h-36 rounded-[28px] items-center justify-center z-10"
        style={{
          backgroundColor: "rgba(255,255,255,0.5)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.8)",
        }}
      >
        {/* QR corners */}
        <View className="items-center gap-1">
          <View className="flex-row gap-3">
            <QRCorner />
            <QRCorner />
          </View>
          <View className="w-16 h-1 bg-[#2D5A45] rounded-full my-0.5" />
          <View className="flex-row gap-3">
            <QRCorner />
            <QRCorner />
          </View>
        </View>
      </View>
    </View>

    {/* QR badge bottom right */}
    <View className="absolute -bottom-6 -right-6 bg-[#366150] w-16 h-16 rounded-full border-4 border-white items-center justify-center z-20 shadow-sm">
      <MaterialCommunityIcons name="qrcode" size={28} color="#fff" />
    </View>

    {/* Instant pickup label */}
    <View className="absolute -bottom-16 bg-white px-5 py-2 rounded-full shadow-sm shadow-[#00000010]">
      <Text className="text-[#333] text-xs font-extrabold tracking-widest">
        INSTANT PICK-UP
      </Text>
    </View>
  </View>
);

// ─────────────────────────────────────────────
// Slide 4 — Save & Impact
// Eco stats / saved meals counter
// ─────────────────────────────────────────────
export const ImpactIllustration = () => (
  <View className="w-[240px] h-[240px] bg-white rounded-[60px] items-center justify-center overflow-hidden shadow-sm shadow-black/5">
    {/* Green blob */}
    <View
      className="absolute bg-[#E8F4EE] rounded-full"
      style={{ width: 200, height: 200, top: -40, right: -40 }}
    />

    <View className="items-center z-10 gap-3 px-4">
      {/* Leaf icon */}
      <View className="w-14 h-14 bg-[#366150] rounded-full items-center justify-center shadow-md shadow-[#36615040]">
        <MaterialCommunityIcons name="leaf" size={28} color="#fff" />
      </View>

      {/* Stats row */}
      <View className="flex-row gap-2 w-full">
        <View className="flex-1 bg-[#F9F9F9] border border-[#E8E8E8] rounded-2xl p-2 items-center">
          <Text className="text-[#366150] text-lg font-black">38</Text>
          <Text className="text-[9px] font-bold text-[#888]">Meals saved</Text>
        </View>
        <View className="flex-1 bg-[#366150] rounded-2xl p-2 items-center">
          <Text className="text-white text-lg font-black">5.2</Text>
          <Text className="text-[9px] font-bold text-[#A8D5BC]">kg CO₂</Text>
        </View>
      </View>

      {/* SAR saved badge */}
      <View className="bg-[#FF7F50] rounded-full px-4 py-1.5 flex-row items-center gap-1">
        <Feather name="trending-down" size={12} color="#fff" />
        <Text className="text-white text-xs font-extrabold">SAR 230 saved</Text>
      </View>
    </View>

    {/* Star decoration */}
    <View className="absolute top-4 left-5 w-7 h-7 bg-[#FFF1E8] rounded-full items-center justify-center">
      <Feather name="star" size={14} color="#FF7F50" />
    </View>
  </View>
);

// ─────────────────────────────────────────────
// Helper: QR corner piece
// ─────────────────────────────────────────────
const QRCorner = () => (
  <View
    style={{
      width: 26,
      height: 26,
      borderWidth: 3.5,
      borderColor: "#2D5A45",
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <View
      style={{
        width: 9,
        height: 9,
        backgroundColor: "#2D5A45",
        borderRadius: 2,
      }}
    />
  </View>
);

const OnboardingScreen = ({ navigation }: Props) => {
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t, i18n } = useTranslation();
  const { completeIntro } = useAuth();

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < LAST_STEP_INDEX) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    completeIntro();
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(nextLang);
  };

  const renderIllustration = (id: string) => {
    switch (id) {
      case "surplus":
        return <WelcomeIllustration />;
      case "surprise":
        return <SurpriseIllustration />;
      case "booking":
        return <BookingIllustration />;
      case "impact":
        return <ImpactIllustration />;
      default:
        return <WelcomeIllustration />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9F9F9]">
      <View className="flex-row justify-between items-center px-6 mt-4 pb-2 z-10">
        <TouchableOpacity onPress={handleComplete}>
          <StyledText className="text-[#64748B] text-base font-medium">
            {t("onboarding.skip")}
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleLanguage}
          className="flex-row items-center bg-[#FF7F5015] px-3 py-1 rounded-full border border-[#FF7F5040]"
        >
          <MaterialCommunityIcons name="earth" size={18} color="#FF7F50" />
          <StyledText className="text-[#FF7F50] ml-1 font-medium pb-1">
            عربي
          </StyledText>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig}
        bounces={false}
        renderItem={({ item }) => (
          <View
            style={{ width }}
            className="items-center justify-center pb-[300px]"
          >
            {renderIllustration(item.id)}
          </View>
        )}
      />

      <View className="absolute bottom-0 w-full bg-white rounded-t-[32px] px-8 pt-10 pb-12 shadow-2xl shadow-black">
        <View className="items-center">
          <StyledText className="text-[#000000] text-2xl font-extrabold text-center mb-4">
            {ONBOARDING_SLIDES[currentIndex].title}
          </StyledText>
          <StyledText className="text-[#555] text-base text-center mb-10 leading-6 px-2">
            {ONBOARDING_SLIDES[currentIndex].description}
          </StyledText>

          <View className="flex-row mb-8">
            {ONBOARDING_SLIDES.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full mx-1 ${
                  currentIndex === index
                    ? "bg-[#FF7F50] w-6"
                    : "bg-[#E2E8F0] w-2"
                }`}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={handleNext}
            className="bg-[#366150] w-full py-4 rounded-2xl items-center"
          >
            <StyledText className="text-white text-lg font-bold">
              {currentIndex === LAST_STEP_INDEX
                ? t("onboarding.get_started")
                : t("onboarding.next")}
            </StyledText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
