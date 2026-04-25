import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import AuthenticatedNavigator from "./AuthenticatedNavigator";
import { useAuth } from "../context/AuthContext";
import "../i18n";
import WelcomeScreen from "../features/auth/screens/WelcomeScreen";
import SelectLocationScreen from "../features/location/SelectLocationScreen";

const RootNavigator = () => {
  const { isAuthenticated, isLoading, hasSelectedLocation, hasSeenIntro } =
    useAuth();

  if (isLoading) {
    // @ts-ignore - navigation prop is optional/handled inside
    return <WelcomeScreen />;
  }

  return (
    <NavigationContainer>
      {hasSeenIntro ? (
        hasSelectedLocation ? (
          <AuthenticatedNavigator />
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
