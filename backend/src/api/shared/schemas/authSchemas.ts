import { z } from 'zod';

// Phone number regex for Egypt (+20), Saudi Arabia (+966), UAE (+971)
const phoneRegex = /^\+(?:20|966|971)\d{9,10}$/;

export const SignupSchema = z.object({
  body: z.object({
    phoneNumber: z.string().regex(phoneRegex, 'Invalid phone number. Must be +20, +966, or +971 followed by 9-10 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters').optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }),
});

export const LoginSchema = z.object({
  body: z.object({
    phoneNumber: z.string().regex(phoneRegex, 'Invalid phone number'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const VerifyOTPSchema = z.object({
  body: z.object({
    phoneNumber: z.string().regex(phoneRegex, 'Invalid phone number'),
    otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must contain only digits'),
  }),
});

export const ResendOTPSchema = z.object({
  body: z.object({
    phoneNumber: z.string().regex(phoneRegex, 'Invalid phone number'),
  }),
});

// Type exports for TypeScript
export type SignupBody = z.infer<typeof SignupSchema>['body'];
export type LoginBody = z.infer<typeof LoginSchema>['body'];
export type VerifyOTPBody = z.infer<typeof VerifyOTPSchema>['body'];
export type ResendOTPBody = z.infer<typeof ResendOTPSchema>['body'];
