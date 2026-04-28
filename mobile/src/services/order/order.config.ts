const ORDER_ENDPOINTS = {
  CREATE: "/customer/orders",
  MY_ORDERS: "/customer/orders",
  STATS: "/customer/orders/stats",
  BY_ID: (id: number) => `/customer/orders/${id}`,
  COLLECT: (id: number) => `/customer/orders/${id}/collect`,
  DEV_STATUS: (id: number) => `/customer/orders/${id}/dev-status`,
};

export default ORDER_ENDPOINTS;
