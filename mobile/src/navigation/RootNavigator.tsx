import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import { useAuth } from "../context/AuthContext";
import "../i18n";
import WelcomeScreen from "../screens/unauthenticated/WelcomeScreen";
import SelectLocationScreen from "@screens/authenticated/SelectLocationScreen";

const RootNavigator = () => {
  const { isAuthenticated, isLoading, hasSelectedLocation } = useAuth();

  if (isLoading) {
    // @ts-ignore - navigation prop is optional/handled inside
    return <WelcomeScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        hasSelectedLocation ? (
          <MainNavigator />
        ) : (
          <SelectLocationScreen />
        )
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
