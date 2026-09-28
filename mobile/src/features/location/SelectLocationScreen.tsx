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
import { useTranslation } from "react-i18next";

export default function SelectLocationScreen() {
  const { setLocationSelected } = useAuth();
  const { t } = useTranslation();
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
          t("location.denied_title"),
          t("location.denied_message"),
          [
            { text: t("location.open_settings"), onPress: () => Linking.openSettings() },
            { text: t("location.continue_anyway"), style: "cancel" },
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
          {t("location.title")}
        </Text>
        <Text className="text-gray-500 text-[15px] text-center leading-6 mb-12">
          {t("location.description")}
        </Text>

        {/* Perks */}
        <View className="w-full gap-3 mb-12">
          {[
            { icon: "store", label: t("location.nearby") },
            { icon: "map-marker-distance", label: t("location.closest") },
            { icon: "map-search", label: t("location.map") },
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
              {t("location.enable")}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} className="py-3 items-center">
          <Text className="text-gray-400 font-semibold text-[14px]">
            {t("common.skip_for_now")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
