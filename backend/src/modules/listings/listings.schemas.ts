import { z } from "zod";

export const NearbyListingsSchema = z.object({
  query: z.object({
    lat: z
      .string()
      .refine((v) => !isNaN(parseFloat(v)), {
        message: "Latitude must be a valid number",
      })
      .transform((v) => parseFloat(v)),
    lng: z
      .string()
      .refine((v) => !isNaN(parseFloat(v)), {
        message: "Longitude must be a valid number",
      })
      .transform((v) => parseFloat(v)),
    radius: z
      .string()
      .optional()
      .default("10")
      .refine((v) => !isNaN(parseFloat(v)), {
        message: "Radius must be a valid number",
      })
      .transform((v) => parseFloat(v)),
  }),
});
