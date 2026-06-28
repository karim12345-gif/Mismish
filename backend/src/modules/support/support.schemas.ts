import { z } from "zod";

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(2000),
});

const OrderSummarySchema = z.object({
  id: z.number(),
  orderCode: z.string(),
  status: z.string(),
  deliveryMethod: z.string(),
  createdAt: z.string(),
  surpriseBox: z
    .object({
      vendor: z
        .object({
          name: z.string(),
        })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
});

export const ChatRequestSchema = z.object({
  body: z.object({
    messages: z
      .array(ChatMessageSchema)
      .min(1)
      .max(20, "Too many messages in context"),
    orderContext: z.array(OrderSummarySchema).max(5).optional(),
  }),
});

export type ChatRequestBody = z.infer<typeof ChatRequestSchema>["body"];
