import { z } from "zod";

export const UpdateProfileSchema = z.object({
  body: z.object({
    name:         z.string().min(1).optional(),
    nameArabic:   z.string().optional(),
    description:  z.string().optional(),
    category:     z.string().optional(),
    address:      z.string().optional(),
    imageUrl:     z.string().optional(),
    phone:        z.string().optional(),
    openingHours: z.string().optional(),
    closingHours: z.string().optional(),
    latitude:     z.number().optional(),
    longitude:    z.number().optional(),
  }),
});

export const CreateListingSchema = z.object({
  body: z.object({
    name:          z.string().min(1),
    description:   z.string().optional(),
    imageUrl:      z.string().optional(),
    price:         z.number().positive(),
    originalPrice: z.number().positive().optional(),
    quantity:      z.number().int().positive(),
    pickupStart:   z.string().datetime(),
    pickupEnd:     z.string().datetime(),
  }),
});

export const UpdateListingSchema = z.object({
  body: z.object({
    name:          z.string().min(1).optional(),
    description:   z.string().optional(),
    imageUrl:      z.string().optional(),
    price:         z.number().positive().optional(),
    originalPrice: z.number().positive().optional(),
    quantity:      z.number().int().min(0).optional(),
    pickupStart:   z.string().datetime().optional(),
    pickupEnd:     z.string().datetime().optional(),
  }),
});

export const UpdateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(["CONFIRMED", "READY_FOR_PICKUP", "COMPLETED", "CANCELLED"]),
  }),
});
