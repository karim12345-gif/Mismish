import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthStackParamList } from "./types";
import WelcomeScreen from "../features/auth/screens/WelcomeScreen";
import OnboardingScreen from "../features/auth/onboarding/Onboarding.screen";
import AuthStartScreen from "../features/auth/screens/AuthStartScreen";
import LoginScreen from "../features/auth/screens/LoginScreen";
import SignupScreen from "../features/auth/screens/SignupScreen";

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
