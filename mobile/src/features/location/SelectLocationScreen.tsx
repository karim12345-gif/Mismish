import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "../../context/LocationContext";

export default function SelectLocationScreen() {
  const { setLocationSelected } = useAuth();
  const { setLocationByCoords } = useLocation();
  const [loading, setLoading] = useState(false);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocationByCoords(loc.coords.latitude, loc.coords.longitude);
      } else {
        Alert.alert(
          "Location Denied",
          "You can enable it later in Settings so we can show bags near you.",
          [
            { text: "Open Settings", onPress: () => Linking.openSettings() },
            { text: "Continue anyway", style: "cancel" },
          ],
        );
      }
    } catch {
      // Permission check failed — proceed anyway
    } finally {
      setLoading(false);
      setLocationSelected();
    }
  };

  const handleSkip = () => {
    setLocationSelected();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-8 items-center justify-center">
        {/* Illustration */}
        <View
          className="w-36 h-36 rounded-[48px] items-center justify-center mb-10"
          style={{ backgroundColor: "#FFF1E8" }}
        >
          <View
            className="w-24 h-24 rounded-[36px] items-center justify-center"
            style={{ backgroundColor: "#FF7F5020" }}
          >
            <Ionicons name="location" size={52} color="#FF7F50" />
          </View>
        </View>

        {/* Copy */}
        <Text className="text-[#111] font-black text-[28px] text-center mb-3 leading-tight">
          Find bags{"\n"}near you 📍
        </Text>
        <Text className="text-gray-500 text-[15px] text-center leading-6 mb-12">
          We use your location to show rescue bags from restaurants close to you.
          We never store or share it.
        </Text>

        {/* Perks */}
        <View className="w-full gap-3 mb-12">
          {[
            { icon: "store", label: "See what's available nearby" },
            { icon: "map-marker-distance", label: "Sort by closest first" },
            { icon: "map-search", label: "Explore the map view" },
          ].map((item) => (
            <View key={item.label} className="flex-row items-center">
              <View
                className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: "#F3FFF8" }}
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={18}
                  color="#18C96D"
                />
              </View>
              <Text className="text-[#333] font-semibold text-[14px]">
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <TouchableOpacity
          onPress={handleEnable}
          disabled={loading}
          className="w-full h-14 rounded-2xl items-center justify-center mb-3"
          style={{ backgroundColor: "#FF7F50" }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-black text-[16px]">
              Enable Location
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} className="py-3 items-center">
          <Text className="text-gray-400 font-semibold text-[14px]">
            Skip for now
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
