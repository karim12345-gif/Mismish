import { DeliveryMethod } from "@prisma/client";

export interface CreateOrderBody {
  surpriseBoxId: number;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
}

export interface ImpactStats {
  sarSaved: number;
  mealsRescued: number;
  co2Reduced: number;
}
