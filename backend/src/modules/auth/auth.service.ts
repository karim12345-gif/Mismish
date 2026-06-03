import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import appleSignin from "apple-signin-auth";
import admin from "../../shared/lib/firebase";
import prisma from "../../shared/lib/prisma";
import { AppError } from "../../shared/lib/AppError";
import { generateOTP, sendOTP, maskPhoneNumber } from "../../shared/lib/sms";
import { sendPasswordResetEmail } from "../../shared/lib/email";
import {
  generateAccessToken,
  generateRefreshToken,
  createRefreshTokenRecord,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from "../../shared/lib/token";
import type {
  RegisterUserBody,
  LoginUserBody,
  VerifyOTPBody,
  SocialLoginBody,
  CustomerAuthResult,
  RegisterVendorBody,
  LoginVendorBody,
  VendorAuthResult,
} from "./auth.types";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Customer ────────────────────────────────────────────────────────────────

export const sendOtp = async (
  phoneNumber: string,
): Promise<{ devOtp?: string }> => {
  let user = await prisma.user.findUnique({ where: { phoneNumber } });
  if (!user)
    user = await prisma.user.create({
      data: { phoneNumber, isVerified: false },
    });

  const otp = generateOTP();
  await prisma.user.update({
    where: { phoneNumber },
    data: {
      otp,
      otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      otpResendCount: 0,
      lastOtpSentAt: new Date(),
    },
  });

  await sendOTP(phoneNumber, otp);
  return process.env.SMS_DEV_MODE === "true" ? { devOtp: otp } : {};
};

export const registerUser = async (data: RegisterUserBody): Promise<void> => {
  const existing = await prisma.user.findUnique({
    where: { phoneNumber: data.phoneNumber },
  });
  if (existing) throw new AppError(400, "Phone number already registered");

  const hashedPassword = await bcrypt.hash(data.password, 10);
  await prisma.user.create({
    data: { ...data, password: hashedPassword, isVerified: false },
  });
};

export const loginUser = async (
  data: LoginUserBody,
): Promise<{ maskedPhone: string }> => {
  const user = await prisma.user.findUnique({
    where: { phoneNumber: data.phoneNumber },
  });
  if (!user) throw new AppError(401, "Invalid credentials");

  const isMatch = await bcrypt.compare(data.password, user.password!);
  if (!isMatch) throw new AppError(401, "Invalid credentials");

  const otp = generateOTP();
  await prisma.user.update({
    where: { phoneNumber: data.phoneNumber },
    data: {
      otp,
      otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      otpResendCount: 0,
      lastOtpSentAt: new Date(),
    },
  });

  await sendOTP(data.phoneNumber, otp);
  return { maskedPhone: maskPhoneNumber(data.phoneNumber) };
};

export const verifyOTP = async (
  data: VerifyOTPBody,
  deviceInfo?: string,
  ipAddress?: string,
): Promise<CustomerAuthResult> => {
  const user = await prisma.user.findUnique({
    where: { phoneNumber: data.phoneNumber },
  });
  if (!user) throw new AppError(404, "User not found");
  if (!user.otp || !user.otpExpiresAt)
    throw new AppError(400, "No OTP requested. Please login first.");
  if (new Date() > user.otpExpiresAt)
    throw new AppError(400, "OTP expired. Please request a new one.");
  if (user.otp !== data.otp) throw new AppError(400, "Invalid OTP");

  await prisma.user.update({
    where: { phoneNumber: data.phoneNumber },
    data: {
      isVerified: true,
      otp: null,
      otpExpiresAt: null,
      otpResendCount: 0,
    },
  });

  const accessToken = generateAccessToken(user.id, "user");
  const refreshToken = generateRefreshToken();
  await createRefreshTokenRecord(user.id, refreshToken, deviceInfo, ipAddress);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      email: user.email,
      isVerified: true,
      needsProfile: !user.name || !user.email,
    },
  };
};

export const resendOTP = async (
  phoneNumber: string,
): Promise<{ attemptsRemaining: number }> => {
  const user = await prisma.user.findUnique({ where: { phoneNumber } });
  if (!user) throw new AppError(404, "User not found");
  if (user.otpResendCount >= 2)
    throw new AppError(
      429,
      "Maximum OTP resend attempts reached. Please login again.",
    );

  const otp = generateOTP();
  await prisma.user.update({
    where: { phoneNumber },
    data: {
      otp,
      otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      otpResendCount: user.otpResendCount + 1,
      lastOtpSentAt: new Date(),
    },
  });

  await sendOTP(phoneNumber, otp);
  return { attemptsRemaining: 2 - user.otpResendCount };
};

export const socialLogin = async (
  data: SocialLoginBody,
  deviceInfo?: string,
  ipAddress?: string,
): Promise<CustomerAuthResult> => {
  let email: string | undefined;
  let googleId: string | undefined;
  let appleId: string | undefined;
  let phoneNumber: string | undefined;
  let name = "User";

  if (data.provider === "google") {
    const ticket = await googleClient.verifyIdToken({
      idToken: data.idToken,
      audience: [
        process.env.GOOGLE_CLIENT_ID || "",
        process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "",
        "505490363229-enso09ftem17pq92gc6e4i60tv0qsk0d.apps.googleusercontent.com",
      ],
    });
    const payload = ticket.getPayload();
    if (!payload) throw new AppError(401, "Invalid Google token");
    email = payload.email;
    googleId = payload.sub;
    name = payload.name || name;
  } else if (data.provider === "apple") {
    const { sub, email: appleEmail } = await appleSignin.verifyIdToken(
      data.idToken,
      {
        audience: process.env.APPLE_BUNDLE_ID || "com.mismish.app",
        ignoreExpiration: true,
      },
    );
    appleId = sub;
    email = appleEmail;
  } else if (data.provider === "firebase_phone") {
    const decoded = await admin.auth().verifyIdToken(data.idToken);
    if (!decoded.phone_number)
      throw new AppError(401, "Firebase token has no phone number");
    phoneNumber = decoded.phone_number;
  }

  if (!email && !googleId && !appleId && !phoneNumber)
    throw new AppError(400, "Could not verify identity from provider");

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(googleId ? [{ googleId }] : []),
        ...(appleId ? [{ appleId }] : []),
        ...(email ? [{ email }] : []),
        ...(phoneNumber ? [{ phoneNumber }] : []),
      ],
    },
  });

  if (user) {
    if (data.provider === "google" && !user.googleId && googleId)
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    if (data.provider === "apple" && !user.appleId && appleId)
      user = await prisma.user.update({
        where: { id: user.id },
        data: { appleId },
      });
    if (data.provider === "firebase_phone" && !user.isVerified)
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
  } else {
    user = await prisma.user.create({
      data: { email, googleId, appleId, phoneNumber, name, isVerified: true },
    });
  }

  const accessToken = generateAccessToken(user.id, "user");
  const refreshToken = generateRefreshToken();
  await createRefreshTokenRecord(user.id, refreshToken, deviceInfo, ipAddress);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      needsProfile: !user.name || !user.email,
    },
  };
};

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<{ accessToken: string }> => {
  const userId = await verifyRefreshToken(refreshToken);
  if (!userId) throw new AppError(401, "Invalid or expired refresh token");
  return { accessToken: generateAccessToken(userId, "user") };
};

export const logout = async (refreshToken: string): Promise<void> => {
  const revoked = await revokeRefreshToken(refreshToken);
  if (!revoked) throw new AppError(400, "Failed to logout");
};

export const changePassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");
  if (!user.password)
    throw new AppError(400, "User does not have a password set");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new AppError(400, "Current password is incorrect");

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: await bcrypt.hash(newPassword, 10),
      passwordChangedAt: new Date(),
    },
  });
  await revokeAllUserTokens(userId);
};

// ─── Vendor ──────────────────────────────────────────────────────────────────

const signVendorToken = (vendorId: number): string =>
  jwt.sign({ id: vendorId, type: "vendor" }, process.env.JWT_SECRET as string, {
    expiresIn: "14d",
  });

export const registerVendor = async (
  data: RegisterVendorBody,
): Promise<VendorAuthResult> => {
  const existing = await prisma.vendor.findUnique({
    where: { email: data.email },
  });
  if (existing) throw new AppError(400, "Vendor already exists");

  const vendor = await prisma.vendor.create({
    data: { ...data, password: await bcrypt.hash(data.password, 10) },
  });

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

  const isMatch = await bcrypt.compare(data.password, vendor.password);
  if (!isMatch) throw new AppError(401, "Invalid credentials");

  return {
    token: signVendorToken(vendor.id),
    vendor: { id: vendor.id, email: vendor.email, name: vendor.name },
  };
};

export const forgotVendorPassword = async (email: string): Promise<void> => {
  const vendor = await prisma.vendor.findUnique({ where: { email } });
  // Always respond with success — don't leak whether the email exists
  if (!vendor) return;

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.vendor.update({
    where: { email },
    data: {
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
    },
  });

  await sendPasswordResetEmail(email, rawToken);
};

export const resetVendorPassword = async (
  rawToken: string,
  newPassword: string,
): Promise<void> => {
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const vendor = await prisma.vendor.findFirst({
    where: {
      passwordResetToken: hashedToken,
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
};

export { maskPhoneNumber };
