import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "./types";
import HomeScreen from "../features/home/Home.screen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";
import OrdersScreen from "../features/orders/Orders.screen";
import MapScreen from "../features/map/MapScreen";
import PlaceholderScreen from "../features/profile/screens/PlaceholderScreen";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import CartReservationBanner from "../features/cart/CartReservationBanner";

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator = () => {
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#FFFFFF",
          tabBarInactiveTintColor: "#9DA3A6",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 0,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            position: "absolute",
            paddingTop: Platform.OS === "ios" ? 15 : 10,
            paddingBottom: Platform.OS === "ios" ? 30 : 10,
            height: Platform.OS === "ios" ? 95 : 75,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 15,
            elevation: 10,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconContent;

            if (route.name === "Home") {
              iconContent = (
                <MaterialCommunityIcons name="home" size={26} color={color} />
              );
            } else if (route.name === "Map") {
              iconContent = <Ionicons name="map" size={22} color={color} />;
            } else if (route.name === "Orders") {
              iconContent = <Ionicons name="receipt" size={22} color={color} />;
            } else if (route.name === "Account") {
              iconContent = <Ionicons name="person" size={24} color={color} />;
            } else {
              iconContent = <Ionicons name="square" size={24} color={color} />;
            }

            return (
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: focused ? "#1B4332" : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {iconContent}
              </View>
            );
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Home" }}
        />
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{ title: "Map" }}
        />
        <Tab.Screen
          name="Orders"
          component={OrdersScreen}
          options={{ title: "Orders" }}
        />
        <Tab.Screen
          name="Account"
          component={ProfileScreen}
          options={{ title: "Account" }}
        />
      </Tab.Navigator>
      <CartReservationBanner />
    </View>
  );
};

export default MainNavigator;
