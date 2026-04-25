import { z } from "zod";
import { phoneRegex } from "../utils";

export const SendOtpSchema = z.object({
  body: z.object({
    phoneNumber: z
      .string()
      .regex(
        phoneRegex,
        "Invalid phone number. Must be +20, +966, or +971 followed by 9-10 digits",
      ),
  }),
});

export const SignupSchema = z.object({
  body: z.object({
    phoneNumber: z
      .string()
      .regex(
        phoneRegex,
        "Invalid phone number. Must be +20, +966, or +971 followed by 9-10 digits",
      ),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    address: z
      .string()
      .min(5, "Address must be at least 5 characters")
      .optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }),
});

export const LoginSchema = z.object({
  body: z.object({
    phoneNumber: z.string().regex(phoneRegex, "Invalid phone number"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const VerifyOTPSchema = z.object({
  body: z.object({
    phoneNumber: z.string().regex(phoneRegex, "Invalid phone number"),
    otp: z
      .string()
      .length(6, "OTP must be 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only digits"),
  }),
});

export const ResendOTPSchema = z.object({
  body: z.object({
    phoneNumber: z.string().regex(phoneRegex, "Invalid phone number"),
  }),
});

export const RefreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

export const LogoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

export const ChangePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
  }),
});

export const SocialLoginSchema = z.object({
  body: z.object({
    provider: z.enum(["google", "apple"]),
    idToken: z.string().min(1, "Identity Token is required"),
  }),
});

// Type exports for TypeScript
export type SendOtpZodBody = z.infer<typeof SendOtpSchema>["body"];
export type SignupBody = z.infer<typeof SignupSchema>["body"];
export type LoginBody = z.infer<typeof LoginSchema>["body"];
export type VerifyOTPBody = z.infer<typeof VerifyOTPSchema>["body"];
export type ResendOTPBody = z.infer<typeof ResendOTPSchema>["body"];
export type RefreshTokenBody = z.infer<typeof RefreshTokenSchema>["body"];
export type LogoutBody = z.infer<typeof LogoutSchema>["body"];
export type ChangePasswordBody = z.infer<typeof ChangePasswordSchema>["body"];
export type SocialLoginBody = z.infer<typeof SocialLoginSchema>["body"];
