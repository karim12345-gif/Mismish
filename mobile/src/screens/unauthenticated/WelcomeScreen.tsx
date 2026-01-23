import React, { useEffect, useRef } from 'react';
import { View, Image } from 'react-native';
import LottieView from 'lottie-react-native';
import { moderateScale } from 'react-native-size-matters';

export default function WelcomeScreen({ navigation }: { navigation: any }) {
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    // Navigate after 3.2 seconds
    const timer = setTimeout(() => {
        if (navigation && navigation.replace) {
             navigation.replace('Onboarding');
        }
    }, 3200);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-mismish-teal">
      {/* Lottie */}
      <LottieView
        ref={lottieRef}
        source={require('../../../assets/animations/Flow 2.json')}
        autoPlay
        loop={false}
        style={{
          width: moderateScale(260),
          height: moderateScale(260),
        }}
       onAnimationFinish={() => {
          navigation.replace('Onboarding');
        }}
      />

      {/* Bottom Pattern Image */}
      <Image
        source={require('../../../assets/images/pattern.png')}
        resizeMode="cover"
        className="absolute bottom-0 w-full h-90"
      />
    </View>
  );
}
