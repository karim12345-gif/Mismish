export interface PricedCartItem {
  price: number;
  quantity: number;
}

export const calculateCartLineTotal = (item: PricedCartItem): number =>
  item.price * item.quantity;

export const calculateCartSubtotal = (items: PricedCartItem[]): number =>
  items.reduce((total, item) => total + calculateCartLineTotal(item), 0);
