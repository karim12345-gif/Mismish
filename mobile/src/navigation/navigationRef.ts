import { createNavigationContainerRef } from "@react-navigation/native";
import type { AuthenticatedStackParamList } from "./AuthenticatedNavigator";

export const navigationRef =
  createNavigationContainerRef<AuthenticatedStackParamList>();

let pendingNotificationData: Record<string, unknown> | null = null;

const numericId = (value: unknown) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export function openNotificationData(data: Record<string, unknown>): void {
  if (!navigationRef.isReady()) {
    pendingNotificationData = data;
    return;
  }

  try {
    const vendorId = numericId(data.vendorId);
    const listingId = numericId(data.listingId);
    const orderId = numericId(data.orderId);

    if (vendorId) {
      navigationRef.navigate("SurpriseBag", {
        storeId: vendorId,
        ...(listingId ? { listingId } : {}),
      });
      pendingNotificationData = null;
      return;
    }

    if (orderId) {
      navigationRef.navigate("OrderDetails", { orderId });
      pendingNotificationData = null;
    }
  } catch {
    pendingNotificationData = data;
  }
}

export function flushPendingNotification(): void {
  if (pendingNotificationData) openNotificationData(pendingNotificationData);
}
