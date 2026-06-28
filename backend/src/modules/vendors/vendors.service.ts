import { OrderStatus } from "@prisma/client";
import prisma from "../../shared/lib/prisma";
import { AppError } from "../../shared/lib/AppError";
import { sendPushNotification } from "../../shared/lib/notifications";
import { scheduleListingNotification } from "../../shared/lib/notificationScheduler";

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

  // Immediate push: tell followers a new bag was posted right now
  notifyFavorites(vendorId, {
    title: `🆕 New bag from ${vendor?.name ?? "a store you follow"}`,
    body: `${vendor?.name} just posted a surprise bag for SAR ${data.price.toFixed(2)} — grab it before it's gone!`,
    data: { vendorId },
  });

  // Scheduled push: notify followers again when the pickup window actually opens
  scheduleListingNotification(listing);

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

  // Notify followers only if price dropped
  if (data.price !== undefined && data.price < listing.price) {
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId }, select: { name: true } });
    notifyFavorites(vendorId, {
      title: `🔥 Price drop at ${vendor?.name ?? "a store you follow"}`,
      body: `${vendor?.name} just dropped their bag to SAR ${data.price.toFixed(2)}. Limited stock!`,
      data: { vendorId },
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
    data: { status },
    include: {
      surpriseBox: { select: { id: true, name: true, price: true } },
      user:        { select: { id: true, name: true, phoneNumber: true } },
    },
  });

  // Push notification to customer
  const pushCopy = ORDER_STATUS_PUSH[status];
  if (pushCopy && order.user.pushToken) {
    sendPushNotification({
      to: order.user.pushToken,
      title: pushCopy.title,
      body: pushCopy.body(order.surpriseBox.vendor.name),
      data: { orderId: order.id },
    });
  }

  return updated;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function notifyFavorites(
  vendorId: number,
  message: { title: string; body: string; data?: Record<string, unknown> },
): Promise<void> {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { vendorId },
      include: { user: { select: { pushToken: true } } },
    });

    const tokens = favorites
      .map((f) => f.user.pushToken)
      .filter((t): t is string => !!t && t.startsWith("ExponentPushToken"));

    // Send in batches of 100 (Expo limit)
    for (let i = 0; i < tokens.length; i += 100) {
      const batch = tokens.slice(i, i + 100);
      await Promise.all(
        batch.map((to) =>
          sendPushNotification({ to, ...message }),
        ),
      );
    }
  } catch {
    // Non-fatal — don't block the response
  }
}
