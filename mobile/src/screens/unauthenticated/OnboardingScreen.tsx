import React from 'react';
import { View, Image, Text } from 'react-native';
import { styled } from 'nativewind';
import { moderateScale } from 'react-native-size-matters';
import BottomSheet from '../../components/BottomSheet';
import Button from '../../components/Button';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Define navigation types locally
type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
};

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

interface Props {
  navigation: OnboardingScreenNavigationProp;
}

const StyledView = styled(View);
const StyledText = styled(Text);

export default function OnboardingScreen({ navigation }: Props) {
  return (
    <SafeAreaProvider >
        <View className="flex-1 items-center bg-white">
            {/* Top Right: Food Background */}
            <Image
                source={require('../../../assets/images/food_BackGround.png')}
                className="absolute top-0 right-0 w-100 h-64"
                resizeMode="contain"
            />

            {/* Center: Logo */}
            {/* Adjusting margin top to push it down a bit, visualized from the design */}
            <View className="flex-1 justify-center items-center pb-32">
                 <Image
                    source={require('../../../assets/images/Mismish_onBoarding.png')}
                    style={{
                        width: moderateScale(200),
                        height: moderateScale(100),
                    }}
                    resizeMode="contain"
                />
            </View>

            {/* Bottom Sheet */}
            <BottomSheet>
                <View className="flex-1 items-center px-4">
                    {/* Welcome Text */}
                    <StyledText className="text-white text-2xl font-bold mb-8 text-center">
                        Welcome to MishMish!
                    </StyledText>

                    {/* Pagination Dots */}
                    <View className="flex-row gap-2 mb-8">
                        <View className="w-8 h-2 rounded-full bg-[#F59E0B]" />
                        <View className="w-2 h-2 rounded-full bg-white opacity-50" />
                        <View className="w-2 h-2 rounded-full bg-white opacity-50" />
                        <View className="w-2 h-2 rounded-full bg-white opacity-50" />
                        <View className="w-2 h-2 rounded-full bg-white opacity-50" />
                    </View>

                    {/* Buttons */}
                    <View className="w-full mt-8">
                        <Button 
                            label="Next" 
                            onPress={() => {
                                // Logic for next onboarding step or navigation
                                console.log('Next pressed');
                            }} 
                        />
                        
                        <Button 
                            label="Skip for now" 
                            variant="outline"
                            className="bg-white" // Explicitly ensure white bg if not default for outline in Button
                            onPress={() => {
                                // Logic to skip onboarding
                                console.log('Skip pressed');
                            }} 
                        />
                    </View>
                </View>
            </BottomSheet>
        </View>
    </SafeAreaProvider>
  );
}
