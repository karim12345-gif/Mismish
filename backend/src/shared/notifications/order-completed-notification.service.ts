import prisma from "../lib/prisma";
import type { SendToToken } from "./notification.types";
import {
  localizedStoreName,
  notificationLanguage,
  orderCompletedCopy,
} from "./notification-copy";

export const sendOrderCompleted = async (
  orderId: number,
  sendToToken: SendToToken,
): Promise<boolean> => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      status: true,
      pickupStatus: true,
      completedNotificationSentAt: true,
      user: {
        select: {
          id: true,
          isBlocked: true,
          pushToken: true,
          preferredLanguage: true,
        },
      },
      surpriseBox: {
        select: {
          vendor: { select: { name: true, nameArabic: true } },
        },
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

  const language = notificationLanguage(order.user.preferredLanguage);
  const accepted = await sendToToken(order.user.pushToken, {
    ...orderCompletedCopy(
      language,
      localizedStoreName(language, order.surpriseBox.vendor),
    ),
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
};
