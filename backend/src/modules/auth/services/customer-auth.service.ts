import bcrypt from "bcrypt";
import prisma from "../../../shared/lib/prisma";
import { AppError } from "../../../shared/lib/AppError";
import { sendOTP, verifyOTPCode, maskPhoneNumber } from "../../../shared/lib/sms";
import {
  generateAccessToken,
  generateRefreshToken,
  createRefreshTokenRecord,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from "../../../shared/lib/token";
import type {
  RegisterUserBody,
  LoginUserBody,
  VerifyOTPBody,
  CustomerAuthResult,
} from "../auth.types";
import {
  assertInitialOtpRequestAllowed,
  assertOtpResendAllowed,
} from "./otp-policy";

type OtpLanguage = "en" | "ar";

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const MAX_OTP_RESENDS = 2;

const otpState = (language: OtpLanguage, devOtp?: string) => ({
  otp: devOtp ?? null,
  otpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
  otpResendCount: 0,
  lastOtpSentAt: new Date(),
  preferredLanguage: language,
});

export const sendOtp = async (
  phoneNumber: string,
  language: OtpLanguage = "en",
): Promise<{ devOtp?: string }> => {
  let user = await prisma.user.findUnique({ where: { phoneNumber } });
  if (!user) {
    user = await prisma.user.create({
      data: { phoneNumber, isVerified: false },
    });
  }

  assertInitialOtpRequestAllowed(user);

  const delivery = await sendOTP(phoneNumber, language);
  await prisma.user.update({
    where: { phoneNumber },
    data: otpState(language, delivery.devOtp),
  });

  return delivery;
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
  if (user.isBlocked) throw new AppError(403, "This account is blocked");

  if (!user.password) throw new AppError(401, "Invalid credentials");
  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) throw new AppError(401, "Invalid credentials");
  assertInitialOtpRequestAllowed(user);

  const delivery = await sendOTP(data.phoneNumber, data.language);
  await prisma.user.update({
    where: { phoneNumber: data.phoneNumber },
    data: otpState(data.language ?? "en", delivery.devOtp),
  });

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
  if (user.isBlocked) throw new AppError(403, "This account is blocked");
  if (!user.otpExpiresAt) {
    throw new AppError(400, "No OTP requested. Please login first.");
  }
  if (new Date() > user.otpExpiresAt) {
    throw new AppError(400, "OTP expired. Please request a new one.");
  }
  await verifyOTPCode(data.phoneNumber, data.otp, user.otp);

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
  language: OtpLanguage = "en",
): Promise<{ attemptsRemaining: number; devOtp?: string }> => {
  const user = await prisma.user.findUnique({ where: { phoneNumber } });
  if (!user) throw new AppError(404, "User not found");
  if (user.otpResendCount >= MAX_OTP_RESENDS) {
    throw new AppError(
      429,
      "Maximum OTP resend attempts reached. Please login again.",
    );
  }
  assertOtpResendAllowed(user);

  const delivery = await sendOTP(phoneNumber, language);
  const nextResendCount = user.otpResendCount + 1;
  await prisma.user.update({
    where: { phoneNumber },
    data: {
      ...otpState(language, delivery.devOtp),
      otpResendCount: nextResendCount,
    },
  });

  return {
    attemptsRemaining: MAX_OTP_RESENDS - nextResendCount,
    ...(delivery.devOtp ? { devOtp: delivery.devOtp } : {}),
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
  if (!user.password) {
    throw new AppError(400, "User does not have a password set");
  }

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
