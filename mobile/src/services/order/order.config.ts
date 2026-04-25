const ORDER_ENDPOINTS = {
  CREATE: "/customer/orders",
  MY_ORDERS: "/customer/orders",
  BY_ID: (id: number) => `/customer/orders/${id}`,
};

export default ORDER_ENDPOINTS;
