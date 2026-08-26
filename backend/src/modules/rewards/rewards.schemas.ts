import { z } from "zod";

export const RedeemRewardSchema = z.object({
  body: z.object({
    rewardId: z.number().int().positive(),
  }),
});
