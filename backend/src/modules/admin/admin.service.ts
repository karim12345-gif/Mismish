import { OrderStatus, Prisma, VendorStatus } from "@prisma/client";
import prisma from "../../shared/lib/prisma";
import { AppError } from "../../shared/lib/AppError";
import { sendVendorApprovalEmail } from "../../shared/lib/email";

const DEFAULT_LIMIT = 50;

const limitFrom = (value?: string): number =>
  Math.min(Math.max(Number(value) || DEFAULT_LIMIT, 1), 100);

const activeOrderStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "READY_FOR_PICKUP",
  "ON_THE_WAY",
];

export const getSummary = async () => {
  const [
    totalUsers,
    blockedUsers,
    totalVendors,
    pendingVendors,
    activeOrders,
    totalOrders,
    totalListings,
    recentOrders,
    revenueOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isBlocked: true } }),
    prisma.vendor.count(),
    prisma.vendor.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: { in: activeOrderStatuses } } }),
    prisma.order.count(),
    prisma.surpriseBox.count(),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, phoneNumber: true } },
        surpriseBox: {
          select: {
            id: true,
            name: true,
            price: true,
            vendor: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: {
        quantity: true,
        surpriseBox: { select: { price: true } },
      },
    }),
  ]);

  const revenue = revenueOrders.reduce(
    (sum, order) => sum + order.quantity * order.surpriseBox.price,
    0,
  );

  return {
    metrics: {
      totalUsers,
      blockedUsers,
      totalVendors,
      pendingVendors,
      activeOrders,
      totalOrders,
      totalListings,
      revenue,
    },
    recentOrders,
  };
};

export const getVendors = async (query: {
  q?: string;
  status?: string;
  limit?: string;
}) => {
  const where: Prisma.VendorWhereInput = {};
  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { email: { contains: query.q, mode: "insensitive" } },
      { category: { contains: query.q, mode: "insensitive" } },
    ];
  }
  if (
    query.status &&
    ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].includes(query.status)
  ) {
    where.status = query.status as VendorStatus;
  }

  return prisma.vendor.findMany({
    where,
    take: limitFrom(query.limit),
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { listings: true, reviews: true, favorites: true } },
    },
  });
};

export const updateVendorStatus = async (
  adminId: number,
  vendorId: number,
  status: VendorStatus,
) => {
  const currentVendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { status: true },
  });
  if (!currentVendor) throw new AppError(404, "Vendor not found");

  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: { status },
    select: { id: true, email: true, name: true, status: true },
  });

  await logAction(adminId, "vendor.status_updated", "Vendor", vendorId, {
    status,
  });

  if (status === "APPROVED" && currentVendor.status !== "APPROVED") {
    try {
      await sendVendorApprovalEmail(vendor.email, vendor.name);
    } catch (error) {
      console.error("[email] vendor approval email failed:", error);
    }
  }

  return vendor;
};

export const getUsers = async (query: { q?: string; limit?: string }) => {
  const where: Prisma.UserWhereInput = {};
  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { email: { contains: query.q, mode: "insensitive" } },
      { phoneNumber: { contains: query.q, mode: "insensitive" } },
    ];
  }

  return prisma.user.findMany({
    where,
    take: limitFrom(query.limit),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      isVerified: true,
      isBlocked: true,
      createdAt: true,
      _count: { select: { orders: true, reviews: true, favorites: true } },
    },
  });
};

export const updateUserBlocked = async (
  adminId: number,
  userId: number,
  isBlocked: boolean,
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isBlocked },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      isBlocked: true,
    },
  });

  await logAction(adminId, isBlocked ? "user.blocked" : "user.unblocked", "User", userId, {
    isBlocked,
  });

  return user;
};

export const getOrders = async (query: { status?: string; limit?: string }) => {
  const where: Prisma.OrderWhereInput = {};
  if (
    query.status &&
    [
      "PENDING",
      "CONFIRMED",
      "READY_FOR_PICKUP",
      "ON_THE_WAY",
      "DELIVERED",
      "COMPLETED",
      "CANCELLED",
    ].includes(query.status)
  ) {
    where.status = query.status as OrderStatus;
  }

  return prisma.order.findMany({
    where,
    take: limitFrom(query.limit),
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, phoneNumber: true } },
      surpriseBox: {
        select: {
          id: true,
          name: true,
          price: true,
          vendor: { select: { id: true, name: true } },
        },
      },
    },
  });
};

export const getListings = async (query: { q?: string; limit?: string }) => {
  const where: Prisma.SurpriseBoxWhereInput = {};
  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { vendor: { name: { contains: query.q, mode: "insensitive" } } },
    ];
  }

  return prisma.surpriseBox.findMany({
    where,
    take: limitFrom(query.limit),
    orderBy: { createdAt: "desc" },
    include: {
      vendor: { select: { id: true, name: true, status: true } },
      _count: { select: { orders: true } },
    },
  });
};

export const getAuditLogs = async (query: { limit?: string }) =>
  prisma.auditLog.findMany({
    take: limitFrom(query.limit),
    orderBy: { createdAt: "desc" },
    include: {
      admin: { select: { id: true, name: true, email: true, role: true } },
    },
  });

export const getMe = async (adminId: number) => {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });
  if (!admin || !admin.isActive) throw new AppError(401, "Admin not found");
  return admin;
};

async function logAction(
  adminId: number,
  action: string,
  entityType: string,
  entityId?: number,
  metadata?: Prisma.InputJsonValue,
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      adminId,
      action,
      entityType,
      entityId,
      metadata,
    },
  });
}
