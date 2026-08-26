import crypto from "crypto";
import { AppError } from "./AppError";
import {
  sendAuthenticaOtp,
  verifyAuthenticaOtp,
  type OtpLanguage,
} from "./authentica";

// Supported: Egypt (+20), Saudi Arabia (+966), UAE (+971)
export const phoneRegex = /^\+(?:20|966|971)\d{9,10}$/;

export const generateOTP = (): string =>
  crypto.randomInt(1000, 10_000).toString();

export const validatePhoneNumber = (phone: string): boolean =>
  phoneRegex.test(phone);

export const maskPhoneNumber = (phone: string): string => {
  if (phone.length < 8) return phone;
  return `${phone.slice(0, 3)}***${phone.slice(-4)}`;
};

export const sendOTP = async (
  phoneNumber: string,
  language: OtpLanguage = "en",
): Promise<{ devOtp?: string }> => {
  if (process.env.SMS_DEV_MODE === "true") {
    const otp = generateOTP();
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📱 SMS OTP (DEV MODE)");
    console.log(`To:   ${phoneNumber}`);
    console.log(`Code: ${otp}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return { devOtp: otp };
  }

  await sendAuthenticaOtp(phoneNumber, language);
  return {};
};

export const verifyOTPCode = async (
  phoneNumber: string,
  submittedOtp: string,
  devOtp: string | null,
): Promise<void> => {
  if (process.env.SMS_DEV_MODE !== "true") {
    await verifyAuthenticaOtp(phoneNumber, submittedOtp);
    return;
  }

  if (!devOtp) throw new AppError(400, "No OTP requested.", "otp_not_requested");

  const expected = Buffer.from(devOtp);
  const submitted = Buffer.from(submittedOtp);
  if (
    expected.length !== submitted.length ||
    !crypto.timingSafeEqual(expected, submitted)
  ) {
    throw new AppError(400, "Invalid OTP.", "invalid_otp");
  }
};
