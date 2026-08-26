import type { OrderStatus } from "@prisma/client";
import prisma from "./prisma";
import { sendPushNotification } from "./notifications";

export type PickupReminderKind = "oneHour" | "fifteenMinutes";

type RecipientType = "USER" | "MERCHANT" | "ADMIN";

type NotificationMessage = {
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

type TokenDelivery = {
  devices: number;
  sent: number;
  failed: number;
};

export type ReminderDeliveryResult =
  | { outcome: "sent" }
  | { outcome: "reschedule" }
  | { outcome: "skipped"; reason: string }
  | { outcome: "failed"; reason: string };

const TERMINAL_ORDER_STATUSES = new Set([
  "CANCELLED",
  "COMPLETED",
  "DELIVERED",
  "REFUNDED",
  "REJECTED",
]);

const DATABASE_TERMINAL_ORDER_STATUSES: OrderStatus[] = [
  "COMPLETED",
  "CANCELLED",
  "DELIVERED",
];

const isPickupReminderTestMode = () =>
  process.env.NODE_ENV !== "production" &&
  process.env.PICKUP_REMINDER_TEST_MODE === "true";

export const getPickupReminderDefinition = (kind: PickupReminderKind) => {
  const testMode = isPickupReminderTestMode();

  if (kind === "oneHour") {
    return {
      sentField: "pickupOneHourReminderSentAt" as const,
      offsetMs: (testMode ? 2 : 60) * 60 * 1000,
      title: "⏰ Your pickup is coming up",
      body: (store: string) =>
        testMode
          ? `Your order from ${store} will be ready for pickup in 2 minutes.`
          : `Your order from ${store} will be ready for pickup in 1 hour.`,
    };
  }

  return {
    sentField: "pickupFifteenMinuteReminderSentAt" as const,
    offsetMs: (testMode ? 1 : 15) * 60 * 1000,
    title: "🛍️ Almost pickup time!",
    body: (store: string) =>
      testMode
        ? `Your order from ${store} is ready to be picked up in 1 minute.`
        : `Your order from ${store} is ready to be picked up in 15 minutes.`,
  };
};

const isTerminalOrder = (status: string, pickupStatus: string) =>
  TERMINAL_ORDER_STATUSES.has(status) ||
  pickupStatus === "COLLECTED" ||
  pickupStatus === "NO_SHOW";

const buildProviderData = (message: NotificationMessage) => ({
  eventType: message.eventType,
  ...(message.recipientType
    ? { recipientType: message.recipientType }
    : {}),
  ...(message.recipientId !== undefined
    ? { recipientId: message.recipientId }
    : {}),
  ...(message.entityType ? { entityType: message.entityType } : {}),
  ...(message.entityId !== undefined ? { entityId: message.entityId } : {}),
  ...message.data,
});

async function claimPickupReminder(
  orderId: number,
  kind: PickupReminderKind,
  pickupStart: Date,
  claimedAt: Date,
): Promise<boolean> {
  const sharedWhere = {
    id: orderId,
    deliveryMethod: "PICKUP" as const,
    status: { notIn: DATABASE_TERMINAL_ORDER_STATUSES },
    pickupStatus: "PENDING" as const,
    surpriseBox: { pickupStart },
  };

  const result =
    kind === "oneHour"
      ? await prisma.order.updateMany({
          where: {
            ...sharedWhere,
            pickupOneHourReminderSentAt: null,
          },
          data: { pickupOneHourReminderSentAt: claimedAt },
        })
      : await prisma.order.updateMany({
          where: {
            ...sharedWhere,
            pickupFifteenMinuteReminderSentAt: null,
          },
          data: { pickupFifteenMinuteReminderSentAt: claimedAt },
        });

  return result.count === 1;
}

async function releasePickupReminderClaim(
  orderId: number,
  kind: PickupReminderKind,
  claimedAt: Date,
): Promise<void> {
  if (kind === "oneHour") {
    await prisma.order.updateMany({
      where: { id: orderId, pickupOneHourReminderSentAt: claimedAt },
      data: { pickupOneHourReminderSentAt: null },
    });
    return;
  }

  await prisma.order.updateMany({
    where: { id: orderId, pickupFifteenMinuteReminderSentAt: claimedAt },
    data: { pickupFifteenMinuteReminderSentAt: null },
  });
}

class NotificationService {
  async sendToToken(
    token: string,
    message: NotificationMessage,
  ): Promise<boolean> {
    const accepted = await sendPushNotification({
      to: token,
      title: message.title,
      body: message.body,
      imageUrl: message.imageUrl,
      data: buildProviderData(message),
    });

    const logContext = {
      eventType: message.eventType,
      recipientType: message.recipientType,
      recipientId: message.recipientId,
      entityType: message.entityType,
      entityId: message.entityId,
      accepted,
    };

    if (accepted) {
      console.info("[push] provider accepted notification", logContext);
    } else {
      console.error("[push] provider rejected notification", logContext);
    }

    return accepted;
  }

  async sendToTokens(
    tokens: string[],
    message: NotificationMessage,
    batchSize = 50,
  ): Promise<TokenDelivery> {
    const uniqueTokens = [...new Set(tokens.filter(Boolean))];
    let sent = 0;

    for (let index = 0; index < uniqueTokens.length; index += batchSize) {
      const batch = uniqueTokens.slice(index, index + batchSize);
      const results = await Promise.all(
        batch.map((token) => this.sendToToken(token, message)),
      );
      sent += results.filter(Boolean).length;
    }

    return {
      devices: uniqueTokens.length,
      sent,
      failed: uniqueTokens.length - sent,
    };
  }

  async sendToUser(
    userId: number,
    message: Omit<NotificationMessage, "recipientType" | "recipientId">,
  ): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: { id: userId, isBlocked: false },
      select: { pushToken: true },
    });

    if (!user?.pushToken) {
      console.info("[push] notification skipped: no eligible device", {
        eventType: message.eventType,
        userId,
      });
      return false;
    }

    return this.sendToToken(user.pushToken, {
      ...message,
      recipientType: "USER",
      recipientId: userId,
    });
  }

  async sendPickupReminder(
    orderId: number,
    kind: PickupReminderKind,
    scheduledPickupStartMs: number,
  ): Promise<ReminderDeliveryResult> {
    const definition = getPickupReminderDefinition(kind);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        status: true,
        pickupStatus: true,
        deliveryMethod: true,
        pickupOneHourReminderSentAt: true,
        pickupFifteenMinuteReminderSentAt: true,
        user: { select: { id: true, isBlocked: true, pushToken: true } },
        surpriseBox: {
          select: {
            pickupStart: true,
            vendor: { select: { name: true } },
          },
        },
      },
    });

    if (!order) return { outcome: "skipped", reason: "order_not_found" };
    if (order.deliveryMethod !== "PICKUP") {
      return { outcome: "skipped", reason: "not_a_pickup_order" };
    }
    if (isTerminalOrder(order.status, order.pickupStatus)) {
      return { outcome: "skipped", reason: "order_is_terminal" };
    }
    if (order[definition.sentField]) {
      return { outcome: "skipped", reason: "already_sent" };
    }
    if (order.surpriseBox.pickupStart.getTime() !== scheduledPickupStartMs) {
      return { outcome: "reschedule" };
    }
    if (order.user.isBlocked || !order.user.pushToken) {
      return { outcome: "skipped", reason: "no_eligible_device" };
    }

    const claimedAt = new Date();
    const claimed = await claimPickupReminder(
      orderId,
      kind,
      order.surpriseBox.pickupStart,
      claimedAt,
    );

    if (!claimed) {
      return { outcome: "skipped", reason: "already_claimed_or_ineligible" };
    }

    const latest = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        status: true,
        pickupStatus: true,
        deliveryMethod: true,
        user: { select: { id: true, isBlocked: true, pushToken: true } },
        surpriseBox: {
          select: {
            pickupStart: true,
            vendor: { select: { name: true } },
          },
        },
      },
    });

    if (
      !latest ||
      latest.deliveryMethod !== "PICKUP" ||
      isTerminalOrder(latest.status, latest.pickupStatus) ||
      latest.user.isBlocked ||
      !latest.user.pushToken
    ) {
      await releasePickupReminderClaim(orderId, kind, claimedAt);
      return { outcome: "skipped", reason: "order_became_ineligible" };
    }

    if (latest.surpriseBox.pickupStart.getTime() !== scheduledPickupStartMs) {
      await releasePickupReminderClaim(orderId, kind, claimedAt);
      return { outcome: "reschedule" };
    }

    const accepted = await this.sendToToken(latest.user.pushToken, {
      title: definition.title,
      body: definition.body(latest.surpriseBox.vendor.name),
      eventType: kind === "oneHour" ? "pickup_reminder_1h" : "pickup_reminder_15m",
      recipientType: "USER",
      recipientId: latest.user.id,
      entityType: "ORDER",
      entityId: orderId,
      data: {
        orderId,
        deepLink: `mismish://orders/${orderId}`,
      },
    });

    if (!accepted) {
      await releasePickupReminderClaim(orderId, kind, claimedAt);
      return { outcome: "failed", reason: "provider_rejected" };
    }

    return { outcome: "sent" };
  }

  async sendOrderCompleted(orderId: number): Promise<boolean> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        status: true,
        pickupStatus: true,
        completedNotificationSentAt: true,
        user: { select: { id: true, isBlocked: true, pushToken: true } },
        surpriseBox: {
          select: { vendor: { select: { name: true } } },
        },
      },
    });

    if (
      !order ||
      (order.status !== "COMPLETED" && order.pickupStatus !== "COLLECTED") ||
      order.completedNotificationSentAt ||
      order.user.isBlocked ||
      !order.user.pushToken
    ) {
      return false;
    }

    const claimedAt = new Date();
    const claimed = await prisma.order.updateMany({
      where: {
        id: orderId,
        completedNotificationSentAt: null,
        OR: [{ status: "COMPLETED" }, { pickupStatus: "COLLECTED" }],
      },
      data: { completedNotificationSentAt: claimedAt },
    });

    if (claimed.count === 0) return false;

    const accepted = await this.sendToToken(order.user.pushToken, {
      title: "✅ Order picked up!",
      body: `Your order from ${order.surpriseBox.vendor.name} has been completed. Thanks for saving good food with Mismish 💚`,
      eventType: "order_completed",
      recipientType: "USER",
      recipientId: order.user.id,
      entityType: "ORDER",
      entityId: orderId,
      data: {
        orderId,
        deepLink: `mismish://orders/${orderId}`,
      },
    });

    if (!accepted) {
      await prisma.order.updateMany({
        where: { id: orderId, completedNotificationSentAt: claimedAt },
        data: { completedNotificationSentAt: null },
      });
    }

    return accepted;
  }
}

export const notificationService = new NotificationService();
