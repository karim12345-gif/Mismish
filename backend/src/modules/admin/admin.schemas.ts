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

export const VendorStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
  }),
  body: z.object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]),
  }),
});

export const UserBlockSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
  }),
  body: z.object({
    isBlocked: z.boolean(),
  }),
});
