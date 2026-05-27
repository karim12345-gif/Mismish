import { z } from "zod";

export const SubmitReviewSchema = z.object({
  body: z.object({
    rating:  z.number().int().min(1).max(5),
    comment: z.string().max(500).optional(),
  }),
});
