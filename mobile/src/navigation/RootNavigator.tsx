import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import { useAuth } from "../context/AuthContext";
import "../i18n";
import WelcomeScreen from "../screens/unauthenticated/WelcomeScreen";

const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // @ts-ignore - navigation prop is optional/handled inside
    return <WelcomeScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
