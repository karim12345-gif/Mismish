import { useQuery } from "@tanstack/react-query";
import { OrderServices, ImpactStats } from "../services/order/order.service";
import { useAuth } from "../context/AuthContext";

export const IMPACT_STATS_QUERY_KEY = ["userImpactStats"] as const;

export const useImpactStats = () => {
  const { isAuthenticated } = useAuth();

  return useQuery<ImpactStats, Error>({
    queryKey: IMPACT_STATS_QUERY_KEY,
    queryFn: async () => {
      const response = await OrderServices.getUserImpactStats();
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 30, // 30 seconds
  });
};
