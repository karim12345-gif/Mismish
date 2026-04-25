import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  OrderServices,
  CreateOrderRequest,
  OrderResponse,
} from "../services/order/order.service";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<OrderResponse, Error, CreateOrderRequest>({
    mutationFn: (payload) => OrderServices.createOrder(payload),
    onSuccess: () => {
      // Invalidate orders list so OrdersScreen refreshes automatically
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
