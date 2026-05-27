const ORDER_ENDPOINTS = {
  CREATE: "/orders/v1",
  MY_ORDERS: "/orders/v1",
  STATS: "/orders/v1/stats",
  BY_ID: (id: number) => `/orders/v1/${id}`,
  COLLECT: (id: number) => `/orders/v1/${id}/collect`,
  DEV_STATUS: (id: number) => `/orders/v1/${id}/dev-status`,
};

export default ORDER_ENDPOINTS;
