import { useQuery } from "@tanstack/react-query";
import { OrderServices, Order } from "../services/order/order.service";
import { useAuth } from "../context/AuthContext";

export const MY_ORDERS_QUERY_KEY = ["orders"] as const;

export const useMyOrders = () => {
  const { isAuthenticated } = useAuth();

  return useQuery<Order[], Error>({
    queryKey: MY_ORDERS_QUERY_KEY,
    queryFn: async () => {
      const response = await OrderServices.getMyOrders();
      return response.data;
    },
    enabled: isAuthenticated,
  });
};
