export type PickupReminderKind = "thirtyMinutes" | "fifteenMinutes";

export type RecipientType = "USER" | "MERCHANT" | "ADMIN";

export type NotificationMessage = {
  title: string;
  body: string;
  eventType: string;
  recipientType?: RecipientType;
  recipientId?: number;
  entityType?: "ORDER" | "MERCHANT" | "OFFER" | "CAMPAIGN";
  entityId?: number;
  imageUrl?: string;
  data?: Record<string, unknown>;
};

export type TokenDelivery = {
  devices: number;
  sent: number;
  failed: number;
};

export type ReminderDeliveryResult =
  | { outcome: "sent" }
  | { outcome: "reschedule" }
  | { outcome: "skipped"; reason: string }
  | { outcome: "failed"; reason: string };

export type SendToToken = (
  token: string,
  message: NotificationMessage,
) => Promise<boolean>;
