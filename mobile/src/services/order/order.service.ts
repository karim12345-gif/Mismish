import api from "../api";
import ORDER_ENDPOINTS from "./order.config";

export type DeliveryMethod = "PICKUP" | "DELIVERY";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "READY_FOR_PICKUP"
  | "ON_THE_WAY"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";
export type PickupStatus = "PENDING" | "COLLECTED" | "NO_SHOW";

export interface CreateOrderRequest {
  surpriseBoxId: number;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  pickupOffset?: number; // 0 = today, 1 = tomorrow
  quantity?: number;
}

export interface Order {
  id: number;
  userId: number;
  surpriseBoxId: number;
  quantity: number;
  status: OrderStatus;
  pickupStatus: PickupStatus;
  orderCode: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string | null;
  createdAt: string;
  updatedAt: string;
  review?: { id: number; rating: number } | null;
  surpriseBox?: {
    id: number;
    name: string;
    imageUrl: string | null;
    price: number;
    pickupStart: string;
    pickupEnd: string;
    vendor: {
      id: number;
      name: string;
      address: string | null;
      latitude: number | null;
      longitude: number | null;
    };
  };
}

export interface OrderResponse {
  status: string;
  data: Order;
}

export interface OrdersResponse {
  status: string;
  data: Order[];
}

export interface ImpactStats {
  sarSaved: number;
  mealsRescued: number;
  co2Reduced: number;
}

export interface ImpactStatsResponse {
  status: string;
  data: ImpactStats;
}

const createOrder = async (
  payload: CreateOrderRequest,
): Promise<OrderResponse> => {
  const response = await api.post<OrderResponse>(
    ORDER_ENDPOINTS.CREATE,
    payload,
  );
  return response.data;
};

const getMyOrders = async (): Promise<OrdersResponse> => {
  const response = await api.get<OrdersResponse>(ORDER_ENDPOINTS.MY_ORDERS);
  return response.data;
};

const getUserImpactStats = async (): Promise<ImpactStatsResponse> => {
  const response = await api.get<ImpactStatsResponse>(ORDER_ENDPOINTS.STATS);
  return response.data;
};

const getOrderById = async (id: number): Promise<OrderResponse> => {
  const response = await api.get<OrderResponse>(ORDER_ENDPOINTS.BY_ID(id));
  return response.data;
};

const collectOrder = async (id: number): Promise<OrderResponse> => {
  const response = await api.patch<OrderResponse>(ORDER_ENDPOINTS.COLLECT(id));
  return response.data;
};

const cancelOrder = async (id: number): Promise<OrderResponse> => {
  const response = await api.patch<OrderResponse>(ORDER_ENDPOINTS.CANCEL(id));
  return response.data;
};

const devSetStatus = async (
  id: number,
  status: OrderStatus,
): Promise<OrderResponse> => {
  const response = await api.patch<OrderResponse>(
    ORDER_ENDPOINTS.DEV_STATUS(id),
    { status },
  );
  return response.data;
};

const submitReview = async (
  orderId: number,
  rating: number,
  comment?: string,
): Promise<{ status: string; data: { id: number } }> => {
  const response = await api.post(`/reviews/v1/orders/${orderId}`, {
    rating,
    comment,
  });
  return response.data;
};

const OrderServices = {
  createOrder,
  getMyOrders,
  getUserImpactStats,
  getOrderById,
  collectOrder,
  cancelOrder,
  devSetStatus,
  submitReview,
};

export { OrderServices };
