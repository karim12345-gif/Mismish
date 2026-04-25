import { useQuery } from "@tanstack/react-query";
import { StoreServices, SurpriseBox } from "../services/store/store.service";

export const storeInventoryQueryKey = (storeId: number) =>
  ["stores", storeId, "inventory"] as const;

export const useStoreInventory = (storeId: number) => {
  return useQuery<SurpriseBox[], Error>({
    queryKey: storeInventoryQueryKey(storeId),
    queryFn: async () => {
      const response = await StoreServices.getStoreInventory(storeId);
      return response.data;
    },
    enabled: !!storeId,
  });
};
