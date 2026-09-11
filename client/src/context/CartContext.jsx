import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { MAX_QUANTITY } from '../lib/pricing';

const STORAGE_KEY = 'tastybites-cart';
const CartContext = createContext(null);

const readStoredCart = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((dish, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item._id === dish._id);
      if (existing) {
        return prev.map((item) =>
          item._id === dish._id ? { ...item, quantity: Math.min(item.quantity + quantity, MAX_QUANTITY) } : item
        );
      }
      return [
        ...prev,
        {
          _id: dish._id,
          name: dish.name,
          price: dish.price,
          image: dish.image,
          available: dish.availability,
          quantity: Math.min(quantity, MAX_QUANTITY),
        },
      ];
    });
  }, []);

  const setQuantity = useCallback((id, quantity) => {
    setItems((prev) =>
      quantity < 1
        ? prev.filter((item) => item._id !== id)
        : prev.map((item) => (item._id === id ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) } : item))
    );
  }, []);

  const removeItem = useCallback((id) => setItems((prev) => prev.filter((item) => item._id !== id)), []);

  const clearCart = useCallback(() => setItems([]), []);

  // Prices and stock can change after something is added, so the cart re-checks the live menu
  const refreshFromMenu = useCallback(async () => {
    const { data } = await api.get('/menu-items');
    const latest = new Map(data.items.map((dish) => [dish._id, dish]));

    setItems((prev) =>
      prev.map((item) => {
        const dish = latest.get(item._id);
        return dish
          ? { ...item, name: dish.name, price: dish.price, image: dish.image, available: dish.availability }
          : { ...item, available: false };
      })
    );
  }, []);

  const value = {
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    hasUnavailable: items.some((item) => item.available === false),
    quantityOf: (id) => items.find((item) => item._id === id)?.quantity ?? 0,
    addItem,
    setQuantity,
    removeItem,
    clearCart,
    refreshFromMenu,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
