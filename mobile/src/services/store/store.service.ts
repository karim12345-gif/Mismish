import api from "../api";
import STORE_ENDPOINTS from "./store.config";

export interface SurpriseBox {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  originalPrice: number | null;
  quantity: number;
  pickupStart: string;
  pickupEnd: string;
  vendorId: number;
}

export interface Store {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  reviewCount: number;
  listings: SurpriseBox[];
}

export interface StoresResponse {
  status: string;
  data: Store[];
}

export interface StoreResponse {
  status: string;
  data: Store;
}

export interface InventoryResponse {
  status: string;
  data: SurpriseBox[];
}

const getStores = async (): Promise<StoresResponse> => {
  const response = await api.get<StoresResponse>(STORE_ENDPOINTS.LIST);
  return response.data;
};

const getStoreById = async (id: number): Promise<StoreResponse> => {
  const response = await api.get<StoreResponse>(STORE_ENDPOINTS.BY_ID(id));
  return response.data;
};

const getStoreInventory = async (id: number): Promise<InventoryResponse> => {
  const response = await api.get<InventoryResponse>(
    STORE_ENDPOINTS.INVENTORY(id),
  );
  return response.data;
};

const StoreServices = { getStores, getStoreById, getStoreInventory };

export { StoreServices };
