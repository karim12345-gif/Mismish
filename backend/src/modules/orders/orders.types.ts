import { DeliveryMethod } from "@prisma/client";

export interface CreateOrderBody {
  surpriseBoxId: number;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  pickupOffset?: number; // 0 = today, 1 = tomorrow
  quantity?: number;     // bags requested, defaults to 1
}

export interface ImpactStats {
  sarSaved: number;
  mealsRescued: number;
  co2Reduced: number;
}
