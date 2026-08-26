import { useQuery } from "@tanstack/react-query";
import { StoreServices, Store } from "../services/store/store.service";

export const STORES_QUERY_KEY = ["stores"] as const;

export const useStores = () => {
  return useQuery<Store[], Error>({
    queryKey: STORES_QUERY_KEY,
    queryFn: async () => {
      const response = await StoreServices.getStores();
      return response.data;
    },
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: true,
  });
};
