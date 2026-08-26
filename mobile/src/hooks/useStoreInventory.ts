import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  StoreServices,
  SurpriseBox,
  Store,
} from "../services/store/store.service";
import { STORES_QUERY_KEY } from "./useStores";

export const storeInventoryQueryKey = (storeId: number) =>
  ["stores", storeId, "inventory"] as const;

export const useStoreInventory = (storeId: number) => {
  const queryClient = useQueryClient();
  const cachedStore = queryClient
    .getQueryData<Store[]>(STORES_QUERY_KEY)
    ?.find((store) => store.id === storeId);

  return useQuery<SurpriseBox[], Error>({
    queryKey: storeInventoryQueryKey(storeId),
    queryFn: async () => {
      const response = await StoreServices.getStoreInventory(storeId);
      return response.data;
    },
    enabled: !!storeId,
    initialData: cachedStore?.listings,
    staleTime: 30_000,
  });
};
