import prisma from "../../shared/lib/prisma";
import { AppError } from "../../shared/lib/AppError";

export const submitReview = async (
  userId: number,
  orderId: number,
  rating: number,
  comment?: string,
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { surpriseBox: true },
  });
  if (!order)                    throw new AppError(404, "Order not found");
  if (order.userId !== userId)   throw new AppError(403, "Not your order");
  if (order.status !== "COMPLETED") throw new AppError(400, "Order must be completed before reviewing");

  const existing = await prisma.review.findUnique({ where: { orderId } });
  if (existing) throw new AppError(409, "You have already reviewed this order");

  const vendorId = order.surpriseBox.vendorId;

  return prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: { userId, vendorId, orderId, rating, comment },
    });

    // Recalculate and cache vendor average
    const agg = await tx.review.aggregate({
      where: { vendorId },
      _avg:   { rating: true },
      _count: { rating: true },
    });

    await tx.vendor.update({
      where: { id: vendorId },
      data: {
        rating:      agg._avg.rating ?? null,
        reviewCount: agg._count.rating,
      },
    });

    return review;
  });
};

export const getVendorReviews = async (vendorId: number) =>
  prisma.review.findMany({
    where: { vendorId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
