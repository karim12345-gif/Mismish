const STORE_ROOT = "/customer/stores";

const STORE_ENDPOINTS = {
  LIST: STORE_ROOT,
  BY_ID: (id: number) => `${STORE_ROOT}/${id}`,
  INVENTORY: (id: number) => `${STORE_ROOT}/${id}/inventory`,
};

export default STORE_ENDPOINTS;
