import { AppError } from "../../../shared/lib/AppError";
import prisma from "../../../shared/lib/prisma";

type VendorProfileUpdate = {
  name?: string;
  nameArabic?: string;
  description?: string;
  category?: string;
  address?: string;
  imageUrl?: string;
  phone?: string;
  openingHours?: string;
  closingHours?: string;
  latitude?: number;
  longitude?: number;
};

const PROFILE_SELECT = {
  id: true,
  email: true,
  name: true,
  nameArabic: true,
  description: true,
  category: true,
  address: true,
  imageUrl: true,
  phone: true,
  openingHours: true,
  closingHours: true,
  latitude: true,
  longitude: true,
} as const;

export const getMyProfile = async (vendorId: number) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { ...PROFILE_SELECT, createdAt: true },
  });
  if (!vendor) throw new AppError(404, "Vendor not found");
  return vendor;
};

export const updateMyProfile = async (
  vendorId: number,
  data: VendorProfileUpdate,
) =>
  prisma.vendor.update({
    where: { id: vendorId },
    data,
    select: PROFILE_SELECT,
  });
