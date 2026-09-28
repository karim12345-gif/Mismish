import prisma from "./prisma";
import { sendPushNotification } from "./notifications";
import {
  getPickupReminderDefinition,
  sendOrderCompleted,
  sendPickupReminder,
} from "../notifications/order-notification.service";
import type {
  NotificationMessage,
  PickupReminderKind,
  ReminderDeliveryResult,
  TokenDelivery,
} from "../notifications/notification.types";
import {
  notificationLanguage,
  type NotificationLanguage,
} from "../notifications/notification-copy";

export { getPickupReminderDefinition };
export type { PickupReminderKind, ReminderDeliveryResult };

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

  async sendLocalizedToUser(
    userId: number,
    messageForLanguage: (
      language: NotificationLanguage,
    ) => Omit<NotificationMessage, "recipientType" | "recipientId">,
  ): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: { id: userId, isBlocked: false },
      select: { pushToken: true, preferredLanguage: true },
    });

    if (!user?.pushToken) {
      console.info("[push] notification skipped: no eligible device", {
        userId,
      });
      return false;
    }

    return this.sendToToken(user.pushToken, {
      ...messageForLanguage(notificationLanguage(user.preferredLanguage)),
      recipientType: "USER",
      recipientId: userId,
    });
  }

  sendPickupReminder(
    orderId: number,
    kind: PickupReminderKind,
    scheduledPickupEndMs: number,
  ): Promise<ReminderDeliveryResult> {
    return sendPickupReminder(
      orderId,
      kind,
      scheduledPickupEndMs,
      this.sendToToken.bind(this),
    );
  }

  sendOrderCompleted(orderId: number): Promise<boolean> {
    return sendOrderCompleted(orderId, this.sendToToken.bind(this));
  }
}

export const notificationService = new NotificationService();
