"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

// Define types for our cart items and context
interface CartItem {
  productId: string;
  quantity: number;
  isBundle: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  isLoading: boolean;
  error: any;
  refreshCart: () => Promise<void>;
}

// Create the context with default values
const CartContext = createContext<CartContextType>({
  cartItems: [],
  cartCount: 0,
  isLoading: false,
  error: null,
  refreshCart: async () => {},
});

// Custom hook for using the cart context
export const useCart = () => useContext(CartContext);

// Provider component for our cart context
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Function to fetch cart data from the API
  const fetchCartData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/cart");
      const data = res.data;
      setCartItems(data.items || []);
      console.log("test", res.data);

      // Calculate total items
      const totalItems =
        data.items?.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        ) || 0;

      setCartCount(totalItems);
      setError(null);
    } catch (error) {
      console.error("Error fetching cart data:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load cart data when the component mounts
  useEffect(() => {
    fetchCartData();
  }, []);

  // Public API for refreshing the cart
  const refreshCart = async () => {
    await fetchCartData();
  };

  // The context value that will be supplied to any descendants of this provider
  const contextValue = {
    cartItems,
    cartCount,
    isLoading,
    error,
    refreshCart,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};
