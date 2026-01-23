import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "@screens/unauthenticated/WelcomeScreen";
import OnboardingScreen from "@screens/unauthenticated/onboarding/Onboarding.screen";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
