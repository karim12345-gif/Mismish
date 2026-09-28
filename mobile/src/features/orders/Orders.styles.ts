import { StyleSheet } from "react-native";
import { Order } from "../../services/order/order.service";

export type StatusTheme = { labelKey: string; bg: string; color: string };

export const STATUS_CONFIG: Record<Order["status"], StatusTheme> = {
  PENDING: { labelKey: "orders.statuses.PENDING", bg: "#FFFBEB", color: "#F59E0B" },
  CONFIRMED: { labelKey: "orders.statuses.CONFIRMED", bg: "#F0FDF4", color: "#16A34A" },
  READY_FOR_PICKUP: {
    labelKey: "orders.statuses.READY_FOR_PICKUP",
    bg: "#FFF0EB",
    color: "#FF7F50",
  },
  ON_THE_WAY: { labelKey: "orders.statuses.ON_THE_WAY", bg: "#EFF6FF", color: "#3B82F6" },
  DELIVERED: { labelKey: "orders.statuses.DELIVERED", bg: "#F3F4F6", color: "#6B7280" },
  COMPLETED: { labelKey: "orders.statuses.COMPLETED", bg: "#F3F4F6", color: "#6B7280" },
  CANCELLED: { labelKey: "orders.statuses.CANCELLED", bg: "#FEF2F2", color: "#EF4444" },
};

export const TAB_BADGE_SELECTED = { backgroundColor: "#fff" };
export const TAB_BADGE_UNSELECTED = { backgroundColor: "#FF7F50" };
export const TAB_BADGE_TEXT_SELECTED = { color: "#FF7F50" };
export const TAB_BADGE_TEXT_UNSELECTED = { color: "#fff" };

export const styles = StyleSheet.create({
  collectDisabled: {
    opacity: 0.6,
  },
  collectEnabled: {
    opacity: 1,
  },
});
