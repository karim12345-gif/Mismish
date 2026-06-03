import { GestureHandlerRootView } from "react-native-gesture-handler";
import React from "react";
import Toast from "react-native-toast-message";
import { toastConfig } from "./src/components/ToastConfig";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { AllergyProvider } from "./src/context/AllergyContext";
import { LocationProvider } from "./src/context/LocationContext";
import { CartProvider } from "./src/context/CartContext";
import { FavoritesProvider } from "./src/context/FavoritesContext";
import { CardsProvider } from "./src/context/CardsContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePushNotifications } from "./src/hooks/usePushNotifications";

const queryClient = new QueryClient();

function AppInner() {
  usePushNotifications();
  return <RootNavigator />;
}

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AllergyProvider>
            <LocationProvider>
              <CartProvider>
                <CardsProvider>
                  <FavoritesProvider>
                    <AppInner />
                    <Toast config={toastConfig} />
                  </FavoritesProvider>
                </CardsProvider>
              </CartProvider>
            </LocationProvider>
            </AllergyProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
