interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function sendPushNotification(message: PushMessage): Promise<void> {
  if (!message.to || !message.to.startsWith("ExponentPushToken")) return;

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      to: message.to,
      title: message.title,
      body: message.body,
      data: message.data ?? {},
      sound: "default",
    }),
  }).catch(() => {
    // Non-fatal — best effort delivery
  });
}
