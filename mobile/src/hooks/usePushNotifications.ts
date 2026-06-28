import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import { MY_ORDERS_QUERY_KEY } from "./useMyOrders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications() {
  const queryClient = useQueryClient();

  useEffect(() => {
    registerForPushNotifications();

    // Foreground: notification arrives while app is open → refetch orders
    const receivedSub = Notifications.addNotificationReceivedListener(
      (notification) => {
        if (notification.request.content.data?.orderId) {
          queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
        }
      },
    );

    // Background→foreground: user taps the notification banner → refetch orders
    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        if (response.notification.request.content.data?.orderId) {
          queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
        }
      },
    );

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [queryClient]);
}

async function registerForPushNotifications() {
  if (!Device.isDevice) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  console.log("📲 Expo Push Token:", token); // copy this from Metro terminal to test

  await api.post("/user/push-token", { pushToken: token }).catch(() => {});
}
