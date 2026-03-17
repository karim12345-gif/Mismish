import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthStackParamList } from "./types";
import WelcomeScreen from "@screens/unauthenticated/WelcomeScreen";
import OnboardingScreen from "@screens/unauthenticated/onboarding/Onboarding.screen";
import LoginScreen from "@screens/unauthenticated/LoginScreen";

import AuthStartScreen from "@screens/unauthenticated/AuthStartScreen";
import SignupScreen from "@screens/unauthenticated/SignupScreen";

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Welcome"
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="AuthStart" component={AuthStartScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
