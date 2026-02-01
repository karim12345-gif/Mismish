import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParamList } from "./types";
import WelcomeScreen from "@screens/unauthenticated/WelcomeScreen";
import OnboardingScreen from "@screens/unauthenticated/onboarding/Onboarding.screen";
import LoginScreen from "@screens/unauthenticated/LoginScreen";
// Assuming LoginScreen exists, using placeholder/ensure import works or I'll stub it if file missing.
// I see file exists in file tree from previous context.

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
