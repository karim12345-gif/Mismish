import prisma from "../../shared/lib/prisma";
import { AppError } from "../../shared/lib/AppError";

const activeInventoryFilter = {
  quantity: { gt: 0 },
  pickupEnd: { gt: new Date() },
} as const;

export const getStores = async () =>
  prisma.vendor.findMany({
    include: {
      listings: {
        where: activeInventoryFilter,
        orderBy: { pickupEnd: "asc" },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          price: true,
          originalPrice: true,
          quantity: true,
          pickupStart: true,
          pickupEnd: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

export const getStoreById = async (id: number) => {
  if (isNaN(id)) throw new AppError(400, "Invalid store ID");

  const store = await prisma.vendor.findUnique({
    where: { id },
    include: {
      listings: { where: activeInventoryFilter, orderBy: { pickupEnd: "asc" } },
    },
  });

  if (!store) throw new AppError(404, "Store not found");
  return store;
};

export const getStoreInventory = async (storeId: number) => {
  if (isNaN(storeId)) throw new AppError(400, "Invalid store ID");

  const store = await prisma.vendor.findUnique({ where: { id: storeId } });
  if (!store) throw new AppError(404, "Store not found");

  return prisma.surpriseBox.findMany({
    where: { vendorId: storeId, ...activeInventoryFilter },
    orderBy: { pickupEnd: "asc" },
  });
};
