import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useQueryClient } from "@tanstack/react-query";
import { MY_ORDERS_QUERY_KEY } from "./useMyOrders";
import { openNotificationData } from "../navigation/navigationRef";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleTap = (data?: Record<string, unknown> | null) => {
      if (!data) return;

      if (data.orderId) {
        queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
      }
      openNotificationData(data);
    };

    // Foreground: notification arrives while app is open → refetch orders
    const receivedSub = Notifications.addNotificationReceivedListener(
      (notification) => {
        if (notification.request.content.data?.orderId) {
          queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
        }
      },
    );

    // Background→foreground: user taps the notification banner → refetch orders
    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handleTap(response.notification.request.content.data);
      },
    );

    let disposed = false;
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!disposed && response) {
        handleTap(response.notification.request.content.data);
        Notifications.clearLastNotificationResponseAsync();
      }
    });

    return () => {
      disposed = true;
      receivedSub.remove();
      responseSub.remove();
    };
  }, [queryClient]);
}
