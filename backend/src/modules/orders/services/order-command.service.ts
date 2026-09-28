import { Prisma } from "@prisma/client";
import { AppError } from "../../../shared/lib/AppError";
import {
  cancelPickupReminders,
  schedulePickupReminders,
} from "../../../shared/lib/notificationScheduler";
import { notificationService } from "../../../shared/lib/notificationService";
import { emitOrderEvent } from "../../../shared/lib/orderStream";
import prisma from "../../../shared/lib/prisma";
import { awardOrderPoints } from "../../rewards/rewards.service";
import type { CreateOrderBody } from "../orders.types";
import { orderReceivedCopy } from "../../../shared/notifications/notification-copy";

const generateOrderCode = (): string =>
  Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join("");

export const createOrder = async (userId: number, data: CreateOrderBody) => {
  const quantity = Math.max(1, Math.floor(data.quantity ?? 1));

  const order = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const box = await tx.surpriseBox.findUnique({
        where: { id: data.surpriseBoxId },
      });
      if (!box) throw new AppError(400, "Surprise Box not found");

      const pickupOffset = Math.min(Math.max(data.pickupOffset ?? 0, 0), 1);
      const effectiveEnd = new Date(box.pickupEnd);
      effectiveEnd.setDate(effectiveEnd.getDate() + pickupOffset);
      if (effectiveEnd < new Date()) {
        throw new AppError(400, "Pickup time has ended");
      }

      const decremented = await tx.surpriseBox.updateMany({
        where: { id: data.surpriseBoxId, quantity: { gte: quantity } },
        data: { quantity: { decrement: quantity } },
      });
      if (decremented.count === 0) {
        throw new AppError(400, "Sorry, this bag just sold out");
      }

      let orderCode = generateOrderCode();
      while (await tx.order.findUnique({ where: { orderCode } })) {
        orderCode = generateOrderCode();
      }

      return tx.order.create({
        data: {
          userId,
          surpriseBoxId: data.surpriseBoxId,
          quantity,
          deliveryMethod: data.deliveryMethod,
          deliveryAddress:
            data.deliveryMethod === "DELIVERY"
              ? data.deliveryAddress
              : undefined,
          status: "PENDING",
          orderCode,
          pickupStatus: "PENDING",
          pickupOffset,
          pickupWindowEnd: effectiveEnd,
        },
        include: { surpriseBox: { include: { vendor: true } } },
      });
    },
  );

  void notificationService
    .sendLocalizedToUser(userId, (language) => ({
      ...orderReceivedCopy(language),
      eventType: "order_received",
      entityType: "ORDER",
      entityId: order.id,
      data: {
        orderId: order.id,
        deepLink: `mismish://orders/${order.id}`,
      },
    }))
    .catch((error) => {
      console.error(
        `[push] Order #${order.id} received notification failed:`,
        error,
      );
    });

  schedulePickupReminders({
    id: order.id,
    deliveryMethod: order.deliveryMethod,
    pickupReminderSentAt: null,
    pickupFifteenMinuteReminderSentAt: null,
    pickupWindowEnd: order.pickupWindowEnd,
    surpriseBox: { pickupEnd: order.surpriseBox.pickupEnd },
  });

  emitOrderEvent(order.surpriseBox.vendorId, "new_order", {
    orderId: order.id,
  });

  return order;
};

export const cancelOrder = async (userId: number, orderId: number) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, "Order not found");
  if (order.userId !== userId) throw new AppError(403, "Forbidden");
  if (order.status !== "PENDING") {
    throw new AppError(400, "Only pending orders can be cancelled");
  }

  const cancelled = await prisma.$transaction(async (tx) => {
    const transitioned = await tx.order.updateMany({
      where: { id: orderId, userId, status: "PENDING" },
      data: { status: "CANCELLED" },
    });
    if (transitioned.count !== 1) {
      throw new AppError(
        409,
        "Order status changed while this request was processing",
        "order_status_conflict",
      );
    }

    await tx.surpriseBox.update({
      where: { id: order.surpriseBoxId },
      data: { quantity: { increment: order.quantity } },
    });

    return tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        surpriseBox: {
          include: {
            vendor: {
              select: {
                id: true,
                name: true,
                nameArabic: true,
                address: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
      },
    });
  });

  emitOrderEvent(cancelled.surpriseBox.vendor.id, "order_cancelled", {
    orderId,
  });
  cancelPickupReminders(orderId);

  return cancelled;
};

export const collectOrder = async (userId: number, orderId: number) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, "Order not found");
  if (order.userId !== userId) throw new AppError(403, "Forbidden");
  if (!["PENDING", "CONFIRMED", "READY_FOR_PICKUP"].includes(order.status)) {
    throw new AppError(400, "Order cannot be marked as collected");
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: "COMPLETED", pickupStatus: "COLLECTED" },
    include: {
      surpriseBox: {
        include: {
          vendor: {
            select: {
              name: true,
              nameArabic: true,
              address: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      },
    },
  });

  cancelPickupReminders(orderId);
  await notificationService.sendOrderCompleted(orderId);
  await awardOrderPoints(updated.id);

  return updated;
};
