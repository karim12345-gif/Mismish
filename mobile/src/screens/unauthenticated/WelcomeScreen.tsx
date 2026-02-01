import React, { useEffect, useRef } from "react";
import { View, Image } from "react-native";
import LottieView from "lottie-react-native";
import { moderateScale } from "react-native-size-matters";

const WelcomeScreen = ({ navigation }: { navigation: any }) => {
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    console.log("WelcomeScreen mounted");
    // Navigate after 1.8 seconds
    const timer = setTimeout(() => {
      console.log("WelcomeScreen timeout triggered");
      if (navigation && navigation.replace) {
        navigation.replace("Onboarding");
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-mismish-teal">
      <LottieView
        ref={lottieRef}
        source={require("@assets/animations/Flow 2.json")}
        autoPlay
        loop={false}
        style={{
          width: moderateScale(260),
          height: moderateScale(260),
        }}
        onAnimationFinish={() => {
          console.log(
            "WelcomeScreen animation finished (Ignored for debugging)",
          );
          // navigation.replace("Onboarding");
        }}
      />

      {/* Bottom Pattern Image */}
      <Image
        source={require("@assets/images/pattern.png")}
        resizeMode="cover"
        className="absolute bottom-0 w-full h-90"
      />
    </View>
  );
};

export default WelcomeScreen;
