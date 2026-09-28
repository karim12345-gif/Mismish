import { Prisma } from "@prisma/client";
import { AppError } from "../../../shared/lib/AppError";
import prisma from "../../../shared/lib/prisma";
import { limitFrom } from "../admin.utils";

export const logAdminAction = async (
  adminId: number,
  action: string,
  entityType: string,
  entityId?: number,
  metadata?: Prisma.InputJsonValue,
): Promise<void> => {
  await prisma.auditLog.create({
    data: {
      adminId,
      action,
      entityType,
      entityId,
      metadata,
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
