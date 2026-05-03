import { Request, Response, NextFunction } from "express";
import { DeliveryMethod, OrderStatus, Prisma } from "@prisma/client";
import prisma from "../../../prismaClient";
import { CreateOrderBody } from "./types";
import { sendPushNotification } from "../../shared/utils/notification";

// Helper to generate a 4-digit PIN
const generateOrderCode = () => {
  const chars = "0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const createOrder = async (
  req: Request<{}, {}, CreateOrderBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { surpriseBoxId, deliveryMethod, deliveryAddress } = req.body;
    // req.user is populated by the auth middleware
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    // Interactive Transaction
    const order = await prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        // 1. Check availability
        const box = await transaction.surpriseBox.findUnique({
          where: { id: surpriseBoxId },
        });

        if (!box) {
          throw new Error("Surprise Box not found");
        }

        if (box.quantity <= 0) {
          throw new Error("Surprise Box is out of stock");
        }

        if (new Date(box.pickupEnd) < new Date()) {
          throw new Error("Pickup time has ended");
        }

        // 2. Decrement quantity
        await transaction.surpriseBox.update({
          where: { id: surpriseBoxId },
          data: { quantity: { decrement: 1 } },
        });

        // 3. Create Order with unique code
        // Loop to ensure uniqueness (though collision probability for 6 chars is low for MVP)
        let orderCode = generateOrderCode();
        let isUnique = false;
        while (!isUnique) {
          const existing = await transaction.order.findUnique({
            where: { orderCode },
          });
          if (!existing) isUnique = true;
          else orderCode = generateOrderCode();
        }

        const newOrder = await transaction.order.create({
          data: {
            userId,
            surpriseBoxId,
            deliveryMethod,
            deliveryAddress:
              deliveryMethod === DeliveryMethod.DELIVERY
                ? deliveryAddress
                : undefined,
            status: "PENDING",
            orderCode,
            pickupStatus: "PENDING",
          },
          include: {
            surpriseBox: {
              include: {
                vendor: true,
              },
            },
          },
        });

        return newOrder;
      },
    );

    // Fire-and-forget push notification
    const user = await prisma.user.findUnique({
      where: { id: order.userId },
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

    console.log("SENDING ORDER TO FRONTEND:", JSON.stringify(order, null, 2));
    res.status(201).json({ status: "success", data: order });
  } catch (error: any) {
    if (
      error.message === "Surprise Box not found" ||
      error.message === "Surprise Box is out of stock" ||
      error.message === "Pickup time has ended"
    ) {
      res.status(400).json({ status: "error", message: error.message });
    } else {
      next(error);
    }
  }
};

export const getMyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        surpriseBox: {
          include: {
            vendor: {
              select: { name: true, address: true, latitude: true, longitude: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ status: "success", data: orders });
  } catch (error) {
    next(error);
  }
};

export const collectOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const orderId = parseInt(req.params.id as string);

    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      res.status(404).json({ status: "error", message: "Order not found" });
      return;
    }

    if (order.userId !== userId) {
      res.status(403).json({ status: "error", message: "Forbidden" });
      return;
    }

    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      res.status(400).json({
        status: "error",
        message: "Order cannot be marked as collected",
      });
      return;
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED", pickupStatus: "COLLECTED" },
      include: {
        surpriseBox: {
          include: { vendor: { select: { name: true, address: true, latitude: true, longitude: true } } },
        },
      },
    });

    // Notify user
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

    res.status(200).json({ status: "success", data: updated });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const orderId = parseInt(req.params.id as string);

    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    if (isNaN(orderId)) {
      res.status(400).json({ status: "error", message: "Invalid order ID" });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        surpriseBox: {
          include: {
            vendor: true,
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({ status: "error", message: "Order not found" });
      return;
    }

    // Ensure the order belongs to the requesting user
    if (order.userId !== userId) {
      res.status(403).json({ status: "error", message: "Forbidden" });
      return;
    }

    res.status(200).json({ status: "success", data: order });
  } catch (error) {
    next(error);
  }
};

// GET /api/customer/orders/stats
export const getUserImpactStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }

    // Count all non-cancelled orders for impact stats
    const orders = await prisma.order.findMany({
      where: {
        userId,
        status: { notIn: ["CANCELLED"] },
      },
      select: {
        id: true,
        surpriseBox: {
          select: {
            price: true,
            originalPrice: true,
          },
        },
      },
    });

    const mealsRescued = orders.length;
    const sarSaved = orders.reduce((sum, order) => {
      const original =
        order.surpriseBox.originalPrice || order.surpriseBox.price;
      const saved = original - order.surpriseBox.price;
      return sum + (saved > 0 ? saved : 0);
    }, 0);

    // Standard metric: 1 meal rescued = 2.5kg CO2
    const co2Reduced = mealsRescued * 2.5;

    res.status(200).json({
      status: "success",
      data: {
        sarSaved: Math.round(sarSaved),
        mealsRescued,
        co2Reduced: parseFloat(co2Reduced.toFixed(1)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// DEV ONLY — force-set any order status for manual testing
export const devSetOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orderId = parseInt(req.params.id as string);
    const { status } = req.body as { status: OrderStatus };

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { surpriseBox: { include: { vendor: true } } },
    });

    res.json({ status: "success", data: updated });
  } catch (error) {
    next(error);
  }
};
