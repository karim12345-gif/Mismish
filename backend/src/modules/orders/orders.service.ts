import { OrderStatus, Prisma } from "@prisma/client";
import prisma from "../../shared/lib/prisma";
import { AppError } from "../../shared/lib/AppError";
import { sendPushNotification } from "../../shared/lib/notifications";
import type { CreateOrderBody, ImpactStats } from "./orders.types";

const generateOrderCode = (): string =>
  Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join("");

export const createOrder = async (userId: number, data: CreateOrderBody) => {
  const order = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const box = await tx.surpriseBox.findUnique({
        where: { id: data.surpriseBoxId },
      });
      if (!box) throw new AppError(400, "Surprise Box not found");
      if (box.quantity <= 0)
        throw new AppError(400, "Surprise Box is out of stock");
      if (new Date(box.pickupEnd) < new Date())
        throw new AppError(400, "Pickup time has ended");

      await tx.surpriseBox.update({
        where: { id: data.surpriseBoxId },
        data: { quantity: { decrement: 1 } },
      });

      let orderCode = generateOrderCode();
      while (await tx.order.findUnique({ where: { orderCode } })) {
        orderCode = generateOrderCode();
      }

      return tx.order.create({
        data: {
          userId,
          surpriseBoxId: data.surpriseBoxId,
          deliveryMethod: data.deliveryMethod,
          deliveryAddress:
            data.deliveryMethod === "DELIVERY"
              ? data.deliveryAddress
              : undefined,
          status: "PENDING",
          orderCode,
          pickupStatus: "PENDING",
        },
        include: { surpriseBox: { include: { vendor: true } } },
      });
    },
  );

  // Fire-and-forget push notification
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pushToken: true },
  });
  if (user?.pushToken) {
    sendPushNotification({
      to: user.pushToken,
      title: "Order Received",
      body: "We received your order, waiting for store confirmation.",
      data: { orderId: order.id },
    });
  }

  return order;
};

export const getMyOrders = async (userId: number) =>
  prisma.order.findMany({
    where: { userId },
    include: {
      surpriseBox: {
        include: {
          vendor: {
            select: {
              name: true,
              address: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      },
      review: { select: { id: true, rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });

export const getOrderById = async (userId: number, orderId: number) => {
  if (isNaN(orderId)) throw new AppError(400, "Invalid order ID");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { surpriseBox: { include: { vendor: true } } },
  });

  if (!order) throw new AppError(404, "Order not found");
  if (order.userId !== userId) throw new AppError(403, "Forbidden");

  return order;
};

export const collectOrder = async (userId: number, orderId: number) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, "Order not found");
  if (order.userId !== userId) throw new AppError(403, "Forbidden");
  if (!["PENDING", "CONFIRMED"].includes(order.status)) {
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
              address: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      },
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pushToken: true },
  });
  if (user?.pushToken) {
    sendPushNotification({
      to: user.pushToken,
      title: "Enjoy your bag! 🎉",
      body: "Your order has been collected. Hope you love it!",
      data: { orderId: order.id },
    });
  }

  return updated;
};

export const getUserImpactStats = async (
  userId: number,
): Promise<ImpactStats> => {
  const orders = await prisma.order.findMany({
    where: { userId, status: { notIn: ["CANCELLED"] } },
    select: { surpriseBox: { select: { price: true, originalPrice: true } } },
  });

  const mealsRescued = orders.length;
  const sarSaved = orders.reduce((sum, o) => {
    const saved =
      (o.surpriseBox.originalPrice || o.surpriseBox.price) -
      o.surpriseBox.price;
    return sum + (saved > 0 ? saved : 0);
  }, 0);

  return {
    sarSaved: Math.round(sarSaved),
    mealsRescued,
    co2Reduced: parseFloat((mealsRescued * 2.5).toFixed(1)),
  };
};

// DEV ONLY
export const devSetOrderStatus = async (orderId: number, status: OrderStatus) =>
  prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { surpriseBox: { include: { vendor: true } } },
  });
