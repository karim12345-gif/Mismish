import { OrderStatus } from "@prisma/client";
import prisma from "../../shared/lib/prisma";
import { AppError } from "../../shared/lib/AppError";

// ─── Profile ─────────────────────────────────────────────────────────────────

export const getMyProfile = async (vendorId: number) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: {
      id: true, email: true, name: true, description: true,
      category: true, address: true, imageUrl: true,
      latitude: true, longitude: true, createdAt: true,
    },
  });
  if (!vendor) throw new AppError(404, "Vendor not found");
  return vendor;
};

export const updateMyProfile = async (
  vendorId: number,
  data: {
    name?: string; description?: string; category?: string;
    address?: string; imageUrl?: string;
    latitude?: number; longitude?: number;
  },
) => {
  return prisma.vendor.update({
    where: { id: vendorId },
    data,
    select: {
      id: true, email: true, name: true, description: true,
      category: true, address: true, imageUrl: true,
      latitude: true, longitude: true,
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
  },
) => {
  const start = new Date(data.pickupStart);
  const end   = new Date(data.pickupEnd);
  if (end <= start) throw new AppError(400, "pickupEnd must be after pickupStart");

  return prisma.surpriseBox.create({
    data: { ...data, pickupStart: start, pickupEnd: end, vendorId },
  });
};

export const updateListing = async (
  vendorId: number,
  listingId: number,
  data: {
    name?: string; description?: string; imageUrl?: string;
    price?: number; originalPrice?: number; quantity?: number;
    pickupStart?: string; pickupEnd?: string;
  },
) => {
  const listing = await prisma.surpriseBox.findUnique({ where: { id: listingId } });
  if (!listing)              throw new AppError(404, "Listing not found");
  if (listing.vendorId !== vendorId) throw new AppError(403, "Not your listing");

  const { pickupStart, pickupEnd, ...rest } = data;
  const updateData: Record<string, unknown> = { ...rest };
  if (pickupStart) updateData.pickupStart = new Date(pickupStart);
  if (pickupEnd)   updateData.pickupEnd   = new Date(pickupEnd);

  return prisma.surpriseBox.update({ where: { id: listingId }, data: updateData });
};

export const deleteListing = async (vendorId: number, listingId: number) => {
  const listing = await prisma.surpriseBox.findUnique({ where: { id: listingId } });
  if (!listing)              throw new AppError(404, "Listing not found");
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
    include: { surpriseBox: true },
  });
  if (!order)                              throw new AppError(404, "Order not found");
  if (order.surpriseBox.vendorId !== vendorId) throw new AppError(403, "Not your order");

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      surpriseBox: { select: { id: true, name: true, price: true } },
      user:        { select: { id: true, name: true, phoneNumber: true } },
    },
  });
};
