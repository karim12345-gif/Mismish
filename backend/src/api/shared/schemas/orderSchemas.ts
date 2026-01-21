import { z } from 'zod';
import { DeliveryMethod } from '@prisma/client';

export const CreateOrderSchema = z.object({
  body: z.object({
    surpriseBoxId: z.number().int().positive(),
    deliveryMethod: z.nativeEnum(DeliveryMethod),
    deliveryAddress: z.string().optional(),
  }).refine((data) => {
    if (data.deliveryMethod === DeliveryMethod.DELIVERY && !data.deliveryAddress) {
      return false;
    }
    return true;
  }, {
    message: "Delivery address is required for delivery orders",
    path: ["deliveryAddress"],
  }),
});
