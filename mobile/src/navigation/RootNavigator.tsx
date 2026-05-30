import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./AuthNavigator";
import AuthenticatedNavigator from "./AuthenticatedNavigator";
import { useAuth } from "../context/AuthContext";
import "../i18n";
import WelcomeScreen from "../features/auth/screens/WelcomeScreen";
import SelectLocationScreen from "../features/location/SelectLocationScreen";

const RootNavigator = () => {
  const { isLoading, hasSeenIntro, hasSelectedLocation } = useAuth();

  if (isLoading) {
    // @ts-ignore
    return <WelcomeScreen />;
  }

  return (
    <NavigationContainer>
      {!hasSeenIntro ? (
        // Step 1 — onboarding slides
        <AuthNavigator />
      ) : !hasSelectedLocation ? (
        // Step 2 — location permission (shows right after onboarding, no login needed)
        <SelectLocationScreen />
      ) : (
        // Step 3 — the app (allergy sheet handled inside Home screen, once)
        <AuthenticatedNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
