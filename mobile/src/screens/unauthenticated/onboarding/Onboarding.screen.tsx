import React, { useState, useRef } from "react";
import {
  View,
  Image,
  Text,
  FlatList,
  useWindowDimensions,
  ViewToken,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "nativewind";
import { moderateScale } from "react-native-size-matters";
import { useTranslation } from "react-i18next";

import {
  ONBOARDING_SLIDES,
  TOTAL_STEPS,
  LAST_STEP_INDEX,
} from "./onboarding.constants";
import { Props } from "./types";
import { BottomSheet, Button, InView, Stepper } from "@components/index";

const StyledText = styled(Text);

const OnboardingScreen = ({ navigation }: Props) => {
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation();

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
      navigation.navigate("Login");
    }
  };

  const handleSkip = () => {
    navigation.navigate("Login");
  };

  // Helper to get title based on index (1-based for keys)
  const getSlideTitle = (index: number) => {
    // Keys are step_1_title, step_2_title etc.
    return t(`onboarding.step_${index + 1}_title` as any);
  };

  return (
    <InView className="items-center bg-white">
      {/* Top-right background */}
      <Image
        source={require("@assets/images/food_BackGround.png")}
        className="absolute top-0 right-0 w-64 h-64"
        resizeMode="contain"
      />

      {/* Back button */}
      {currentIndex > 0 && (
        <TouchableOpacity
          onPress={() =>
            flatListRef.current?.scrollToIndex({
              index: currentIndex - 1,
              animated: true,
            })
          }
          className="absolute top-12 left-4 z-10 p-2 rounded-full bg-white/70"
        >
          <Ionicons name="chevron-back" size={24} color="#146566" />
        </TouchableOpacity>
      )}

      {/* Slides */}
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
          <View style={{ width }} className="items-center">
            <View className="mt-60 items-center">
              <Image
                source={item.image}
                style={{
                  width: moderateScale(172),
                  height: moderateScale(162),
                }}
                resizeMode="contain"
              />
            </View>
          </View>
        )}
      />

      {/* Bottom Sheet */}
      <BottomSheet>
        <View className="items-center px-1 w-full">
          <StyledText className="text-white text-2xl font-bold text-center min-h-[56px] mb-4">
            {getSlideTitle(currentIndex)}
          </StyledText>

          <View className="mb-6">
            <Stepper totalSteps={TOTAL_STEPS} currentStep={currentIndex} />
          </View>

          <View className="w-full">
            <Button
              label={
                currentIndex === LAST_STEP_INDEX
                  ? t("onboarding.get_started")
                  : t("onboarding.next")
              }
              onPress={handleNext}
            />

            <Button
              label={t("onboarding.skip")}
              variant="outline"
              className="bg-white"
              onPress={handleSkip}
            />
          </View>
        </View>
      </BottomSheet>
    </InView>
  );
};

export default OnboardingScreen;
