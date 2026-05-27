import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderServices } from "../services/order/order.service";
import { MY_ORDERS_QUERY_KEY } from "./useMyOrders";
import { STORES_QUERY_KEY } from "./useStores";

export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      rating,
      comment,
    }: {
      orderId: number;
      rating: number;
      comment?: string;
    }) => OrderServices.submitReview(orderId, rating, comment),
    onSuccess: () => {
      // Refresh orders (to clear the "Rate" button) + stores (to show updated rating)
      queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STORES_QUERY_KEY });
    },
  });
};
