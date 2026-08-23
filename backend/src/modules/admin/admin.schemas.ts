import { z } from "zod";

export const IdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
  }),
});

export const ListQuerySchema = z.object({
  query: z.object({
    q: z.string().optional(),
    status: z.string().optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export const AuditQuerySchema = z.object({
  query: z.object({
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export const VendorStatusSchema = z
  .object({
    params: z.object({
      id: z.string().regex(/^\d+$/, "ID must be a number"),
    }),
    body: z.object({
      status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]),
      reason: z.string().trim().min(5).max(500).optional(),
    }),
  })
  .superRefine(({ body }, context) => {
    if (
      (body.status === "REJECTED" || body.status === "SUSPENDED") &&
      !body.reason
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "reason"],
        message: `A reason is required when a vendor is ${body.status.toLowerCase()}`,
      });
    }
  });

export const UserBlockSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
  }),
  body: z.object({
    isBlocked: z.boolean(),
  }),
});
