import { z } from 'zod';

export const NearbyListingsSchema = z.object({
  query: z.object({
    lat: z.string().refine((val) => !isNaN(parseFloat(val)), {
      message: "Latitude must be a valid number",
    }).transform((val) => parseFloat(val)),
    lng: z.string().refine((val) => !isNaN(parseFloat(val)), {
      message: "Longitude must be a valid number",
    }).transform((val) => parseFloat(val)),
    radius: z.string().optional().default("10").refine((val) => !isNaN(parseFloat(val)), {
      message: "Radius must be a valid number",
    }).transform((val) => parseFloat(val)),
  }),
});
