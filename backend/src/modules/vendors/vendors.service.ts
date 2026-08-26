import { OrderStatus } from "@prisma/client";
import prisma from "../../shared/lib/prisma";
import { AppError } from "../../shared/lib/AppError";
import {
  cancelPickupReminders,
  reschedulePickupRemindersForListing,
} from "../../shared/lib/notificationScheduler";
import { notificationService } from "../../shared/lib/notificationService";

// ─── Push copy per order status ──────────────────────────────────────────────

const ORDER_STATUS_PUSH: Partial<Record<OrderStatus, { title: string; body: (store: string) => string }>> = {
  CONFIRMED:       { title: "Order Confirmed ✅", body: (s) => `${s} confirmed your order. Head over when ready!` },
  READY_FOR_PICKUP:{ title: "Bag Ready! 🎁",     body: (s) => `Your surprise bag at ${s} is ready for pickup. Don't miss it!` },
  ON_THE_WAY:      { title: "On the way 🛵",      body: (s) => `Your order from ${s} is on its way to you!` },
  DELIVERED:       { title: "Delivered! 🎉",      body: (s) => `Your order from ${s} has been delivered. Enjoy!` },
  CANCELLED:       { title: "Order Cancelled",    body: (s) => `Your order from ${s} was cancelled. Contact support if needed.` },
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export const getMyProfile = async (vendorId: number) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: {
      id: true, email: true, name: true, nameArabic: true,
      description: true, category: true, address: true,
      imageUrl: true, phone: true, openingHours: true,
      closingHours: true, latitude: true, longitude: true,
      createdAt: true,
    },
  });
  if (!vendor) throw new AppError(404, "Vendor not found");
  return vendor;
};

export const updateMyProfile = async (
  vendorId: number,
  data: {
    name?: string; nameArabic?: string; description?: string;
    category?: string; address?: string; imageUrl?: string;
    phone?: string; openingHours?: string; closingHours?: string;
    latitude?: number; longitude?: number;
  },
) => {
  return prisma.vendor.update({
    where: { id: vendorId },
    data,
    select: {
      id: true, email: true, name: true, nameArabic: true,
      description: true, category: true, address: true,
      imageUrl: true, phone: true, openingHours: true,
      closingHours: true, latitude: true, longitude: true,
    },
  });
};

// ─── Listings ─────────────────────────────────────────────────────────────────

export const getMyListings = async (vendorId: number) =>
  prisma.surpriseBox.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
  });

export const createListing = async (
  vendorId: number,
  data: {
    name: string; description?: string; imageUrl?: string;
    price: number; originalPrice?: number; quantity: number;
    pickupStart: string; pickupEnd: string;
    allergens?: string[]; ingredients?: string[];
  },
) => {
  const start = new Date(data.pickupStart);
  const end   = new Date(data.pickupEnd);
  if (end <= start) throw new AppError(400, "pickupEnd must be after pickupStart");

  const [listing, vendor] = await Promise.all([
    prisma.surpriseBox.create({
      data: { ...data, pickupStart: start, pickupEnd: end, vendorId },
    }),
    prisma.vendor.findUnique({ where: { id: vendorId }, select: { name: true } }),
  ]);

  const vendorName = vendor?.name ?? "A favorite store";

  const notificationResult = await notifyFavorites(vendorId, {
    title: "🥐 New food from one of your favorites!",
    body: `${vendorName} just added ${listing.name} for ${listing.price.toFixed(2)} SAR.`,
    data: {
      eventType: "favorite_offer",
      vendorId,
      listingId: listing.id,
      deepLink: `mismish://stores/${vendorId}/offers/${listing.id}`,
    },
  });

  console.info("[push] favorite offer delivery", {
    vendorId,
    listingId: listing.id,
    ...notificationResult,
  });

  if (notificationResult.accepted > 0) {
    await prisma.surpriseBox.update({
      where: { id: listing.id },
      data: { notifiedFollowersAt: new Date() },
    });
  }

  return listing;
};

export const updateListing = async (
  vendorId: number,
  listingId: number,
  data: {
    name?: string; description?: string; imageUrl?: string;
    price?: number; originalPrice?: number; quantity?: number;
    pickupStart?: string; pickupEnd?: string;
    allergens?: string[]; ingredients?: string[];
  },
) => {
  const listing = await prisma.surpriseBox.findUnique({ where: { id: listingId } });
  if (!listing)                          throw new AppError(404, "Listing not found");
  if (listing.vendorId !== vendorId)     throw new AppError(403, "Not your listing");

  const { pickupStart, pickupEnd, ...rest } = data;
  const updateData: Record<string, unknown> = { ...rest };
  if (pickupStart) updateData.pickupStart = new Date(pickupStart);
  if (pickupEnd)   updateData.pickupEnd   = new Date(pickupEnd);

  const updated = await prisma.surpriseBox.update({ where: { id: listingId }, data: updateData });

  if (pickupStart) {
    await reschedulePickupRemindersForListing(listingId);
  }

  // Notify followers only if price dropped
  if (data.price !== undefined && data.price < listing.price) {
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId }, select: { name: true } });
    await notifyFavorites(vendorId, {
      title: `🔥 Price drop at ${vendor?.name ?? "a store you follow"}`,
      body: `${vendor?.name} just dropped their bag to SAR ${data.price.toFixed(2)}. Limited stock!`,
      data: {
        eventType: "favorite_price_drop",
        vendorId,
        listingId,
        deepLink: `mismish://stores/${vendorId}/offers/${listingId}`,
      },
    });
  }

  return updated;
};

export const deleteListing = async (vendorId: number, listingId: number) => {
  const listing = await prisma.surpriseBox.findUnique({ where: { id: listingId } });
  if (!listing)                      throw new AppError(404, "Listing not found");
  if (listing.vendorId !== vendorId) throw new AppError(403, "Not your listing");

  await prisma.surpriseBox.delete({ where: { id: listingId } });
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export const getMyOrders = async (vendorId: number) =>
  prisma.order.findMany({
    where: { surpriseBox: { vendorId } },
    include: {
      surpriseBox: { select: { id: true, name: true, price: true, imageUrl: true } },
      user:        { select: { id: true, name: true, phoneNumber: true } },
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
      surpriseBox: { include: { vendor: { select: { name: true } } } },
      user: { select: { id: true, pushToken: true } },
    },
  });
  if (!order)                                        throw new AppError(404, "Order not found");
  if (order.surpriseBox.vendorId !== vendorId)       throw new AppError(403, "Not your order");

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(status === "COMPLETED" ? { pickupStatus: "COLLECTED" } : {}),
    },
    include: {
      surpriseBox: { select: { id: true, name: true, price: true } },
      user:        { select: { id: true, name: true, phoneNumber: true } },
    },
  });

  if (["COMPLETED", "CANCELLED", "DELIVERED"].includes(status)) {
    cancelPickupReminders(orderId);
  }

  if (status === "COMPLETED") {
    await notificationService.sendOrderCompleted(orderId);
  } else {
    const pushCopy = order.status !== status ? ORDER_STATUS_PUSH[status] : undefined;
    if (pushCopy && order.user.pushToken) {
      await notificationService.sendToToken(order.user.pushToken, {
        title: pushCopy.title,
        body: pushCopy.body(order.surpriseBox.vendor.name),
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function notifyFavorites(
  vendorId: number,
  message: { title: string; body: string; data?: Record<string, unknown> },
): Promise<{ favorites: number; tokens: number; accepted: number; failed: number }> {
  try {
    const favorites = await prisma.favorite.findMany({
      where: {
        vendorId,
        user: {
          isBlocked: false,
          pushToken: { not: null },
        },
      },
      include: { user: { select: { pushToken: true } } },
    });

    const tokens = [
      ...new Set(
        favorites
          .map((favorite) => favorite.user.pushToken)
          .filter((token): token is string => Boolean(token)),
      ),
    ];

    const eventType =
      typeof message.data?.eventType === "string"
        ? message.data.eventType
        : "favorite_update";
    const delivery = await notificationService.sendToTokens(
      tokens,
      {
        title: message.title,
        body: message.body,
        eventType,
        recipientType: "USER",
        entityType: "OFFER",
        entityId:
          typeof message.data?.listingId === "number"
            ? message.data.listingId
            : undefined,
        data: message.data,
      },
      100,
    );

    return {
      favorites: favorites.length,
      tokens: delivery.devices,
      accepted: delivery.sent,
      failed: delivery.failed,
    };
  } catch (error) {
    // Push delivery is best effort and must not block listing mutations.
    console.error("Favorite notification failed:", error);
    return { favorites: 0, tokens: 0, accepted: 0, failed: 0 };
  }
}
