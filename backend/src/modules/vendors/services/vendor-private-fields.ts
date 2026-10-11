import type { Prisma } from "@prisma/client";

/**
 * Vendor columns that must never be serialized to customers or listed in
 * admin tables: credentials and password-reset state. Use with Prisma `omit`
 * wherever a full Vendor relation is included.
 */
export const VENDOR_PRIVATE_FIELDS_OMIT = {
  password: true,
  passwordResetToken: true,
  passwordResetExpiresAt: true,
} as const satisfies Prisma.VendorOmit;
