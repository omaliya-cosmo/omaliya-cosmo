"use client";

import { useState, useEffect } from "react";
import Header from "./Header";
import { usePathname } from "next/navigation";
import axios from "axios";

// Define type for cart items
interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function HeaderWrapper() {
  const [userData, setUserData] = useState(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bundles, setBundles] = useState([]);
  const pathname = usePathname();

  // Load user data and cart from localStorage on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user from localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUserData(JSON.parse(storedUser));
        }

        // Get cart from localStorage
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Listen for storage events to update cart when it changes in another tab/window
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart" && e.newValue) {
        try {
          setCartItems(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Error parsing cart data:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Fetch products, categories and bundles for the header navigation
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products (limit to a few for the header)
        const productsResponse = await axios.get("/api/products?limit=4");
        setProducts(productsResponse.data.products || []);

        // Fetch categories
        const categoriesResponse = await axios.get("/api/categories");
        setCategories(categoriesResponse.data || []);

        // Fetch bundles
        const bundlesResponse = await axios.get("/api/bundleoffers");
        setBundles(bundlesResponse.data || []);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching header data:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate total cart items
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Return the Header component with all required props
  return (
    <Header
      userData={userData}
      cartCount={cartCount}
      products={products}
      categories={categories}
      bundles={bundles}
      loading={loading}
      error={error}
    />
  );
}
