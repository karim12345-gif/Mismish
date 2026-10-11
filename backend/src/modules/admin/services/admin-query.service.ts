import { OrderStatus, Prisma, VendorStatus } from "@prisma/client";
import prisma from "../../../shared/lib/prisma";
import { limitFrom } from "../admin.utils";
import { VENDOR_PRIVATE_FIELDS_OMIT } from "../../vendors/services/vendor-private-fields";

const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "READY_FOR_PICKUP",
  "ON_THE_WAY",
];

const FILTERABLE_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "READY_FOR_PICKUP",
  "ON_THE_WAY",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

const FILTERABLE_VENDOR_STATUSES: VendorStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
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
    prisma.order.count({ where: { status: { in: ACTIVE_ORDER_STATUSES } } }),
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
    FILTERABLE_VENDOR_STATUSES.includes(query.status as VendorStatus)
  ) {
    where.status = query.status as VendorStatus;
  }

  return prisma.vendor.findMany({
    where,
    take: limitFrom(query.limit),
    orderBy: { createdAt: "desc" },
    omit: VENDOR_PRIVATE_FIELDS_OMIT,
    include: {
      _count: { select: { listings: true, reviews: true, favorites: true } },
    },
  });
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

export const getOrders = async (query: {
  status?: string;
  limit?: string;
}) => {
  const where: Prisma.OrderWhereInput = {};
  if (
    query.status &&
    FILTERABLE_ORDER_STATUSES.includes(query.status as OrderStatus)
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

export const getListings = async (query: {
  q?: string;
  limit?: string;
}) => {
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
