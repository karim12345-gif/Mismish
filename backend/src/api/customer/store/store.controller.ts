import { Request, Response, NextFunction } from "express";
import prisma from "../../../prismaClient";

const activeInventoryFilter = {
  quantity: { gt: 0 },
  pickupEnd: { gt: new Date() },
} as const;

export const getStores = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const stores = await prisma.vendor.findMany({
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

    res.status(200).json({ status: "success", data: stores });
  } catch (error) {
    next(error);
  }
};

export const getStoreById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const storeId = parseInt(req.params.id as string, 10);
    if (isNaN(storeId)) {
      res.status(400).json({ status: "error", message: "Invalid store ID" });
      return;
    }

    const store = await prisma.vendor.findUnique({
      where: { id: storeId },
      include: {
        listings: {
          where: activeInventoryFilter,
          orderBy: { pickupEnd: "asc" },
        },
      },
    });

    if (!store) {
      res.status(404).json({ status: "error", message: "Store not found" });
      return;
    }

    res.status(200).json({ status: "success", data: store });
  } catch (error) {
    next(error);
  }
};

export const getStoreInventory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const storeId = parseInt(req.params.id as string, 10);
    if (isNaN(storeId)) {
      res.status(400).json({ status: "error", message: "Invalid store ID" });
      return;
    }

    const store = await prisma.vendor.findUnique({ where: { id: storeId } });
    if (!store) {
      res.status(404).json({ status: "error", message: "Store not found" });
      return;
    }

    const inventory = await prisma.surpriseBox.findMany({
      where: { vendorId: storeId, ...activeInventoryFilter },
      orderBy: { pickupEnd: "asc" },
    });

    res.status(200).json({ status: "success", data: inventory });
  } catch (error) {
    next(error);
  }
};
