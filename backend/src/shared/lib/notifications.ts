import { getFirebaseAdmin } from "./firebase";

interface PushMessage {
  to: string;
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, unknown>;
}

const stringifyData = (data: Record<string, unknown> = {}) =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, String(value)]),
  );

export async function sendPushNotification(
  message: PushMessage,
): Promise<boolean> {
  if (!message.to) return false;

  if (!message.to.startsWith("ExponentPushToken")) {
    try {
      await getFirebaseAdmin().messaging().send({
        token: message.to,
        notification: {
          title: message.title,
          body: message.body,
          ...(message.imageUrl ? { imageUrl: message.imageUrl } : {}),
        },
        data: stringifyData(message.data),
        apns: {
          payload: {
            aps: {
              sound: "default",
              ...(message.imageUrl ? { mutableContent: true } : {}),
            },
          },
          ...(message.imageUrl
            ? { fcmOptions: { imageUrl: message.imageUrl } }
            : {}),
        },
        android: {
          notification: {
            sound: "default",
            ...(message.imageUrl ? { imageUrl: message.imageUrl } : {}),
          },
        },
      });
      return true;
    } catch (error) {
      console.error("FCM push failed:", error);
      return false;
    }
  }

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        ...message,
        data: message.data ?? {},
        sound: "default",
      }),
    });

    if (!response.ok) {
      console.error("Expo push failed:", response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Expo push failed:", error);
    return false;
  }
}
