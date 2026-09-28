import { VendorStatus } from "@prisma/client";
import { AppError } from "../../../shared/lib/AppError";
import {
  sendVendorApprovalEmail,
  sendVendorRejectionEmail,
  sendVendorSuspensionEmail,
} from "../../../shared/lib/email";
import prisma from "../../../shared/lib/prisma";
import { logAdminAction } from "./admin-audit.service";

export const updateVendorStatus = async (
  adminId: number,
  vendorId: number,
  status: VendorStatus,
  reason?: string,
) => {
  const statusReason = reason?.trim();
  if ((status === "REJECTED" || status === "SUSPENDED") && !statusReason) {
    throw new AppError(
      400,
      `A reason is required when a vendor is ${status.toLowerCase()}`,
    );
  }

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

  await logAdminAction(adminId, "vendor.status_updated", "Vendor", vendorId, {
    status,
    ...(statusReason ? { reason: statusReason } : {}),
  });

  let emailStatus: "sent" | "failed" = "sent";
  let emailError: string | undefined;

  try {
    console.info(`[email] status=${status} vendor=${vendorId} to=${vendor.email}`);

    if (status === "APPROVED") {
      await sendVendorApprovalEmail(vendor.email, vendor.name);
    } else if (status === "REJECTED") {
      await sendVendorRejectionEmail(vendor.email, vendor.name, statusReason!);
    } else if (status === "SUSPENDED") {
      await sendVendorSuspensionEmail(vendor.email, vendor.name, statusReason!);
    }

    console.info(`[email] status=${status} vendor=${vendorId} sent`);
  } catch (error) {
    emailStatus = "failed";
    emailError = error instanceof Error ? error.message : String(error);
    console.error(
      `[email] status=${status} vendor=${vendorId} failed: ${emailError}`,
    );
  }

  return { ...vendor, emailStatus, ...(emailError ? { emailError } : {}) };
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

  await logAdminAction(
    adminId,
    isBlocked ? "user.blocked" : "user.unblocked",
    "User",
    userId,
    { isBlocked },
  );

  return user;
};
