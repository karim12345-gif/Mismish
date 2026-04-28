import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderServices } from "../services/order/order.service";
import { MY_ORDERS_QUERY_KEY } from "./useMyOrders";

export const useCollectOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => OrderServices.collectOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
    },
  });
};
