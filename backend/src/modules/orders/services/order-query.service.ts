import { AppError } from "../../../shared/lib/AppError";
import prisma from "../../../shared/lib/prisma";
import { VENDOR_PRIVATE_FIELDS_OMIT } from "../../vendors/services/vendor-private-fields";
import type { ImpactStats } from "../orders.types";

export const getMyOrders = async (userId: number) =>
  prisma.order.findMany({
    where: { userId },
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
      review: { select: { id: true, rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });

export const getOrderById = async (userId: number, orderId: number) => {
  if (isNaN(orderId)) throw new AppError(400, "Invalid order ID");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      surpriseBox: { include: { vendor: { omit: VENDOR_PRIVATE_FIELDS_OMIT } } },
    },
  });

  if (!order) throw new AppError(404, "Order not found");
  if (order.userId !== userId) throw new AppError(403, "Forbidden");

  return order;
};

export const getUserImpactStats = async (
  userId: number,
): Promise<ImpactStats> => {
  const orders = await prisma.order.findMany({
    where: { userId, status: { notIn: ["CANCELLED"] } },
    select: {
      surpriseBox: { select: { price: true, originalPrice: true } },
    },
  });

  const mealsRescued = orders.length;
  const sarSaved = orders.reduce((sum, order) => {
    const saved =
      (order.surpriseBox.originalPrice || order.surpriseBox.price) -
      order.surpriseBox.price;
    return sum + (saved > 0 ? saved : 0);
  }, 0);

  return {
    sarSaved: Math.round(sarSaved),
    mealsRescued,
    co2Reduced: parseFloat((mealsRescued * 2.5).toFixed(1)),
  };
};
