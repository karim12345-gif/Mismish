import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_LISTING_IMAGE } from "../constants/images";

const CART_STORAGE_KEY = "@mismish_cart";

export interface CartItemProduct {
  id: string;
  surpriseBoxId?: number;
  storeId?: number;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  quantity: number;
  maxQuantity?: number;
  pickupOffset?: number;
  pickupEnd?: string;
}

interface CartContextType {
  cartItems: CartItemProduct[];
  cartStoreId: number | null;
  addToCart: (
    item: Omit<CartItemProduct, "quantity">,
    quantity?: number,
  ) => void;
  removeFromCart: (id: string) => void;
  incrementItem: (id: string) => void;
  decrementItem: (id: string) => void;
  totalQuantity: number;
  subtotal: number;
  clearCart: () => void;
  updateStoreOffsets: (storeId: number, offset: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItemProduct[]>([]);
  const hydrated = useRef(false);

  // Load persisted cart on mount
  useEffect(() => {
    AsyncStorage.getItem(CART_STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as CartItemProduct[];
          const persistedStoreId = parsed[0]?.storeId;
          setCartItems(
            parsed
              .filter(
                (item) =>
                  persistedStoreId === undefined ||
                  item.storeId === persistedStoreId,
              )
              .map((item) => ({
                ...item,
                imageUrl: item.imageUrl || DEFAULT_LISTING_IMAGE,
              })),
          );
        } catch {}
      }
      hydrated.current = true;
    });
  }, []);

  // Persist on every change (skip first render before hydration)
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (
    item: Omit<CartItemProduct, "quantity">,
    quantity: number = 1,
  ) => {
    setCartItems((prev) => {
      const existingStoreId = prev[0]?.storeId;
      if (
        existingStoreId !== undefined &&
        item.storeId !== undefined &&
        existingStoreId !== item.storeId
      ) {
        return prev;
      }

      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id
            ? {
                ...p,
                ...item,
                imageUrl: item.imageUrl || p.imageUrl || DEFAULT_LISTING_IMAGE,
                quantity: Math.min(
                  p.quantity + quantity,
                  item.maxQuantity ?? p.maxQuantity ?? Number.POSITIVE_INFINITY,
                ),
                pickupOffset: item.pickupOffset ?? p.pickupOffset,
              }
            : p,
        );
      }
      return [
        ...prev,
        {
          ...item,
          imageUrl: item.imageUrl || DEFAULT_LISTING_IMAGE,
          quantity: Math.min(quantity, item.maxQuantity ?? quantity),
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((p) => p.id !== id));
  };

  const incrementItem = (id: string) => {
    setCartItems((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (p.maxQuantity !== undefined && p.quantity >= p.maxQuantity)
          return p;
        return { ...p, quantity: p.quantity + 1 };
      }),
    );
  };

  const decrementItem = (id: string) => {
    setCartItems((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, quantity: Math.max(0, p.quantity - 1) } : p,
        )
        .filter((p) => p.quantity > 0),
    );
  };

  const updateStoreOffsets = (storeId: number, offset: number) => {
    setCartItems((prev) =>
      prev.map((p) =>
        p.storeId === storeId ? { ...p, pickupOffset: offset } : p,
      ),
    );
  };

  const clearCart = () => setCartItems([]);

  const cartStoreId = cartItems[0]?.storeId ?? null;
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        incrementItem,
        decrementItem,
        clearCart,
        updateStoreOffsets,
        totalQuantity,
        subtotal,
        cartStoreId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
