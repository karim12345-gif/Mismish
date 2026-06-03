import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { useAuth } from "../../../context/AuthContext";
import { AuthServices } from "../../../services/auth/auth.service";

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [deleteSheet, setDeleteSheet] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      setNotificationsEnabled(status === "granted");
    });
  }, []);

  const openDeleteSheet = () => {
    setDeleteSheet(true);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 18 }).start();
  };

  const closeDeleteSheet = () => {
    Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: true }).start(() =>
      setDeleteSheet(false)
    );
  };

  const toggleNotifications = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      setNotificationsEnabled(newStatus === "granted");
    } else {
      Alert.alert(
        "Turn off notifications",
        "To disable, go to your phone Settings → Mismish → Notifications.",
        [{ text: "OK" }]
      );
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await AuthServices.deleteAccount();
      closeDeleteSheet();
      setTimeout(logout, 250);
    } catch {
      setDeleting(false);
      Alert.alert("Error", "Could not delete account. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F4F4F4]">
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-9 h-9 rounded-full bg-white border border-gray-100 items-center justify-center mr-3 shadow-sm shadow-black/5"
        >
          <Feather name="arrow-left" size={16} color="#111" />
        </TouchableOpacity>
        <Text className="text-[#111] text-[20px] font-black">Settings</Text>
      </View>

      <View className="mx-5 mt-2">
        <View className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 overflow-hidden">
          <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
            <View className="w-8 h-8 rounded-xl bg-[#F4F4F4] items-center justify-center mr-3">
              <Feather name="bell" size={15} color="#366150" />
            </View>
            <Text className="flex-1 text-[#222] text-[14px] font-semibold">Push notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: "#E5E7EB", true: "#366150" }}
              thumbColor="#fff"
            />
          </View>

          <TouchableOpacity
            onPress={openDeleteSheet}
            activeOpacity={0.6}
            className="flex-row items-center px-4 py-4"
          >
            <View className="w-8 h-8 rounded-xl bg-[#FEF2F2] items-center justify-center mr-3">
              <Feather name="user-x" size={15} color="#EF4444" />
            </View>
            <Text className="flex-1 text-[#EF4444] text-[14px] font-semibold">Delete account</Text>
            <Feather name="chevron-right" size={17} color="#CCC" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Delete account sheet */}
      <Modal visible={deleteSheet} transparent animationType="none">
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={closeDeleteSheet}>
          <Pressable onPress={() => {}}>
            <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
              <View className="bg-white rounded-t-3xl px-5 pt-6 pb-10">
                <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-6" />

                <View className="w-16 h-16 rounded-full bg-[#FEF2F2] items-center justify-center self-center mb-4">
                  <Feather name="user-x" size={28} color="#EF4444" />
                </View>

                <Text className="text-[#111] text-[18px] font-black text-center mb-2">
                  Delete Account
                </Text>
                <Text className="text-gray-400 text-[13px] font-medium text-center mb-8 leading-5">
                  This will permanently delete your account and all your data. This action cannot be undone.
                </Text>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={closeDeleteSheet}
                    className="flex-1 h-12 rounded-2xl items-center justify-center bg-[#F4F4F4]"
                  >
                    <Text className="text-[#111] font-bold text-[14px]">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDeleteAccount}
                    disabled={deleting}
                    className="flex-1 h-12 rounded-2xl items-center justify-center bg-[#EF4444]"
                  >
                    <Text className="text-white font-bold text-[14px]">
                      {deleting ? "Deleting…" : "Yes, Delete"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
