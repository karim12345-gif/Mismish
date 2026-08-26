import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MainNavigator from "./MainNavigator";
import WalletScreen from "../features/wallet/Wallet.screen";
import SurpriseBagScreen from "../features/store/SurpriseBag.screen";
import CompleteProfileScreen from "../features/profile/screens/CompleteProfileScreen";
import CheckoutScreen from "../features/checkout/Checkout.screen";
import CartScreen from "../features/cart/Cart.screen";
import AddNewCardScreen from "../features/profile/screens/AddNewCardScreen";
import PersonalInfoScreen from "../features/profile/screens/PersonalInfoScreen";
import PaymentMethodScreen from "../features/profile/screens/PaymentMethodScreen";
import CountryScreen from "../features/profile/screens/CountryScreen";
import AllergiesScreen from "../features/profile/screens/AllergiesScreen";
import SettingsScreen from "../features/profile/screens/SettingsScreen";
import FAQScreen from "../features/profile/screens/FAQScreen";
import FavoritesScreen from "../features/favorites/Favorites.screen";
import BookingConfirmedScreen from "../features/checkout/BookingConfirmed.screen";
import DeliveryTrackingScreen from "../features/checkout/DeliveryTracking.screen";
import SearchScreen from "../features/search/Search.screen";
import ElevenUnderScreen from "../features/home/ElevenUnder.screen";
import OrderDetailsScreen from "../features/orders/OrderDetails.screen";
import { Order } from "../services/order/order.service";

export type AuthenticatedStackParamList = {
  MainTabs: undefined;
  Wallet: undefined;
  SurpriseBag:
    | { storeId: number; autoOpenSheet?: boolean; listingId?: number }
    | undefined;
  CompleteProfile: undefined;
  Checkout: undefined;
  Cart: undefined;
  AddNewCard: undefined;
  Favorites: undefined;
  BookingConfirmed: { order: Order };
  OrderDetails: { orderId: number };
  DeliveryTracking: { order: Order };
  Search: undefined;
  ElevenUnder: undefined;
  PersonalInfo: undefined;
  PaymentMethod: undefined;
  Country: { selected?: { flag: string; name: string; code: string }; onSelect?: (c: any) => void };
  Allergies: undefined;
  Settings: undefined;
  FAQ: undefined;
};

const Stack = createStackNavigator<AuthenticatedStackParamList>();

export default function AuthenticatedNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="MainTabs"
    >
      <Stack.Screen name="MainTabs" component={MainNavigator} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="SurpriseBag" component={SurpriseBagScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="AddNewCard" component={AddNewCardScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="BookingConfirmed" component={BookingConfirmedScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="DeliveryTracking" component={DeliveryTrackingScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="ElevenUnder" component={ElevenUnderScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <Stack.Screen name="Country" component={CountryScreen} />
      <Stack.Screen name="Allergies" component={AllergiesScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="FAQ" component={FAQScreen} />
    </Stack.Navigator>
  );
}
