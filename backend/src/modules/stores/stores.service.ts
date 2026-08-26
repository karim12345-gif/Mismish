import prisma from "../../shared/lib/prisma";
import { AppError } from "../../shared/lib/AppError";

const activeInventoryFilter = {
  quantity: { gt: 0 },
  pickupEnd: { gt: new Date() },
} as const;

const publicListingSelect = {
  id: true,
  name: true,
  description: true,
  imageUrl: true,
  price: true,
  originalPrice: true,
  quantity: true,
  allergens: true,
  ingredients: true,
  pickupStart: true,
  pickupEnd: true,
  vendorId: true,
} as const;

const publicStoreSelect = {
  id: true,
  name: true,
  nameArabic: true,
  description: true,
  imageUrl: true,
  category: true,
  latitude: true,
  longitude: true,
  address: true,
  openingHours: true,
  closingHours: true,
  rating: true,
  reviewCount: true,
} as const;

export const getStores = async () =>
  prisma.vendor.findMany({
    where: { status: "APPROVED" },
    select: {
      ...publicStoreSelect,
      listings: {
        where: activeInventoryFilter,
        orderBy: { pickupEnd: "asc" },
        select: publicListingSelect,
      },
    },
    orderBy: { name: "asc" },
  });

export const getStoreById = async (id: number) => {
  if (isNaN(id)) throw new AppError(400, "Invalid store ID");

  const store = await prisma.vendor.findFirst({
    where: { id, status: "APPROVED" },
    select: {
      ...publicStoreSelect,
      listings: {
        where: activeInventoryFilter,
        orderBy: { pickupEnd: "asc" },
        select: publicListingSelect,
      },
    },
  });

  if (!store) throw new AppError(404, "Store not found");
  return store;
};

export const getStoreInventory = async (storeId: number) => {
  if (isNaN(storeId)) throw new AppError(400, "Invalid store ID");

  return prisma.surpriseBox.findMany({
    where: {
      vendorId: storeId,
      vendor: { status: "APPROVED" },
      ...activeInventoryFilter,
    },
    select: publicListingSelect,
    orderBy: { pickupEnd: "asc" },
  });
};
