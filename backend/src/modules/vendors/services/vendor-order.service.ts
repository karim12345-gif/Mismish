import { OrderStatus } from "@prisma/client";
import { AppError } from "../../../shared/lib/AppError";
import { notificationService } from "../../../shared/lib/notificationService";
import { cancelPickupReminders } from "../../../shared/lib/notificationScheduler";
import prisma from "../../../shared/lib/prisma";
import { awardOrderPoints } from "../../rewards/rewards.service";
import {
  isAllowedOrderTransition,
  isTerminalOrderStatus,
} from "../../orders/services/order-status-policy";
import {
  localizedStoreName,
  notificationLanguage,
  orderStatusCopy,
} from "../../../shared/notifications/notification-copy";

export const getMyOrders = async (vendorId: number) =>
  prisma.order.findMany({
    where: { surpriseBox: { vendorId } },
    include: {
      surpriseBox: {
        select: { id: true, name: true, price: true, imageUrl: true },
      },
      user: { select: { id: true, name: true, phoneNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  });

export const updateOrderStatus = async (
  vendorId: number,
  orderId: number,
  status: OrderStatus,
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      surpriseBox: {
        include: { vendor: { select: { name: true, nameArabic: true } } },
      },
      user: {
        select: { id: true, pushToken: true, preferredLanguage: true },
      },
    },
  });
  if (!order) throw new AppError(404, "Order not found");
  if (order.surpriseBox.vendorId !== vendorId) {
    throw new AppError(403, "Not your order");
  }
  if (!isAllowedOrderTransition(order.status, status)) {
    throw new AppError(
      409,
      `Order cannot move from ${order.status} to ${status}`,
      "invalid_order_status_transition",
    );
  }

  const statusChanged = order.status !== status;
  const updated = await prisma.$transaction(async (tx) => {
    if (statusChanged) {
      const transitioned = await tx.order.updateMany({
        where: { id: orderId, status: order.status },
        data: {
          status,
          ...(status === "COMPLETED" ? { pickupStatus: "COLLECTED" } : {}),
        },
      });
      if (transitioned.count !== 1) {
        throw new AppError(
          409,
          "Order status changed while this request was processing",
          "order_status_conflict",
        );
      }

      if (status === "CANCELLED") {
        await tx.surpriseBox.update({
          where: { id: order.surpriseBoxId },
          data: { quantity: { increment: order.quantity } },
        });
      }
    }

    return tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        surpriseBox: { select: { id: true, name: true, price: true } },
        user: { select: { id: true, name: true, phoneNumber: true } },
      },
    });
  });

  if (isTerminalOrderStatus(status)) {
    cancelPickupReminders(orderId);
  }

  if (statusChanged && status === "COMPLETED") {
    await notificationService.sendOrderCompleted(orderId);
    await awardOrderPoints(orderId);
  } else {
    const language = notificationLanguage(order.user.preferredLanguage);
    const pushCopy = statusChanged
      ? orderStatusCopy(
          language,
          status,
          localizedStoreName(language, order.surpriseBox.vendor),
        )
      : null;
    if (pushCopy && order.user.pushToken) {
      await notificationService.sendToToken(order.user.pushToken, {
        title: pushCopy.title,
        body: pushCopy.body,
        eventType: "order_status",
        recipientType: "USER",
        recipientId: order.user.id,
        entityType: "ORDER",
        entityId: order.id,
        data: {
          orderId: order.id,
          deepLink: `mismish://orders/${order.id}`,
        },
      });
    }
  }

  return updated;
};
