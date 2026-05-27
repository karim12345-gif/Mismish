interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function sendPushNotification(
  message: PushMessage,
): Promise<void> {
  if (!message.to?.startsWith("ExponentPushToken")) return;

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      ...message,
      data: message.data ?? {},
      sound: "default",
    }),
  }).catch(() => {
    // Non-fatal — best effort delivery
  });
}
