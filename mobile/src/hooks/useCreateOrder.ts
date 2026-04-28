import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  OrderServices,
  CreateOrderRequest,
  OrderResponse,
} from "../services/order/order.service";
import { STORES_QUERY_KEY } from "./useStores";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<OrderResponse, Error, CreateOrderRequest>({
    mutationFn: (payload) => OrderServices.createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: STORES_QUERY_KEY });
    },
  });
};
