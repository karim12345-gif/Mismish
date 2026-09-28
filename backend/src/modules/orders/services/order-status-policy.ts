import type { OrderStatus } from "@prisma/client";

const ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: ["COMPLETED", "CANCELLED"],
  ON_THE_WAY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  COMPLETED: [],
  CANCELLED: [],
};

export const isAllowedOrderTransition = (
  current: OrderStatus,
  next: OrderStatus,
): boolean => current === next || ALLOWED_TRANSITIONS[current].includes(next);

export const isTerminalOrderStatus = (status: OrderStatus): boolean =>
  status === "COMPLETED" || status === "CANCELLED" || status === "DELIVERED";
