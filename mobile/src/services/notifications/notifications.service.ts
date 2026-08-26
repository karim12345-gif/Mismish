import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  registerDeviceForRemoteMessages,
  requestPermission,
} from "@react-native-firebase/messaging";
import api from "../api";

// Show alerts + play sound when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request permission, get the Expo push token, and save it to the backend.
 * Safe to call multiple times — silently no-ops on simulators and web.
 */
export async function registerForPushNotifications(): Promise<void> {
  // Push doesn't work on simulators or web
  if (!Device.isDevice) {
    console.log("[push] skipped: not a physical device");
    return;
  }

  console.log("[push] registering authenticated device");
  const messagingInstance = getMessaging();
  const authStatus = await requestPermission(messagingInstance);
  const firebaseGranted =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (!firebaseGranted && finalStatus !== "granted") {
    console.log("[push] skipped: notification permission was not granted");
    return;
  }

  // Android needs a notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  await registerDeviceForRemoteMessages(messagingInstance);
  const pushToken = await getToken(messagingInstance);
  console.log("[push] Firebase FCM token:", pushToken);
  await api.post("/users/v1/push-token", { pushToken });
  console.log("[push] token saved to backend");
}
