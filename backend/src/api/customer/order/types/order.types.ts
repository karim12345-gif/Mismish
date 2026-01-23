import { DeliveryMethod } from "@prisma/client";

export interface CreateOrderBody {
  surpriseBoxId: number;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
}
