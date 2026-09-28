import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { AppError } from "../../../shared/lib/AppError";
import {
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
  sendVendorWelcomeEmail,
} from "../../../shared/lib/email";
import prisma from "../../../shared/lib/prisma";
import type {
  LoginVendorBody,
  RegisterVendorBody,
  VendorAuthResult,
} from "../auth.types";

const signVendorToken = (vendorId: number): string =>
  jwt.sign({ id: vendorId, type: "vendor" }, process.env.JWT_SECRET as string, {
    expiresIn: "14d",
  });

const hashResetToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

export const registerVendor = async (
  data: RegisterVendorBody,
): Promise<VendorAuthResult> => {
  const existing = await prisma.vendor.findUnique({
    where: { email: data.email },
  });
  if (existing) throw new AppError(400, "Vendor already exists");

  const vendor = await prisma.vendor.create({
    data: {
      ...data,
      password: await bcrypt.hash(data.password, 10),
      status: "PENDING",
    },
  });

  try {
    await sendVendorWelcomeEmail(vendor.email, vendor.name);
  } catch (error) {
    console.error("[email] vendor welcome email failed:", error);
  }

  return {
    token: signVendorToken(vendor.id),
    vendor: { id: vendor.id, email: vendor.email, name: vendor.name },
  };
};

export const loginVendor = async (
  data: LoginVendorBody,
): Promise<VendorAuthResult> => {
  const vendor = await prisma.vendor.findUnique({
    where: { email: data.email },
  });
  if (!vendor) throw new AppError(401, "Invalid credentials");
  if (vendor.status !== "APPROVED") {
    throw new AppError(403, `Vendor account is ${vendor.status.toLowerCase()}`);
  }

  const isMatch = await bcrypt.compare(data.password, vendor.password);
  if (!isMatch) throw new AppError(401, "Invalid credentials");

  return {
    token: signVendorToken(vendor.id),
    vendor: { id: vendor.id, email: vendor.email, name: vendor.name },
  };
};

export const forgotVendorPassword = async (email: string): Promise<void> => {
  const vendor = await prisma.vendor.findUnique({ where: { email } });
  if (!vendor) return;

  const rawToken = crypto.randomBytes(32).toString("hex");
  await prisma.vendor.update({
    where: { email },
    data: {
      passwordResetToken: hashResetToken(rawToken),
      passwordResetExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  await sendPasswordResetEmail(email, rawToken);
};

export const resetVendorPassword = async (
  rawToken: string,
  newPassword: string,
): Promise<void> => {
  const vendor = await prisma.vendor.findFirst({
    where: {
      passwordResetToken: hashResetToken(rawToken),
      passwordResetExpiresAt: { gt: new Date() },
    },
  });
  if (!vendor) throw new AppError(400, "Reset link is invalid or has expired");

  await prisma.vendor.update({
    where: { id: vendor.id },
    data: {
      password: await bcrypt.hash(newPassword, 10),
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    },
  });

  try {
    await sendPasswordChangedEmail(vendor.email);
  } catch (error) {
    console.error("[email] password changed email failed:", error);
  }
};
