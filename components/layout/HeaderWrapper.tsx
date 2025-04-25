"use client";

import { useState, useEffect } from "react";
import Header from "./Header";
import { usePathname } from "next/navigation";
import axios from "axios";
import { getCustomerFromToken } from "@/app/actions";
import { useCart } from "@/app/lib/hooks/CartContext";

export default function HeaderWrapper() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bundles, setBundles] = useState([]);
  const pathname = usePathname();

  // Use our cart context instead of local state
  const { cartCount } = useCart();

  // Load user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user from localStorage
        const userData = await getCustomerFromToken();
        setUserData(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch products, categories and bundles for the header navigation
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products (limit to a few for the header)
        const productsResponse = await axios.get("/api/products");
        setProducts(productsResponse.data.products || []);

        // Fetch categories
        const categoriesResponse = await axios.get("/api/categories");
        setCategories(categoriesResponse.data.categories || []);

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

  const isAdmin = pathname.startsWith("/admin");

  // Return the Header component with all required props
  return (
    <>
      {!isAdmin && (
        <Header
          userData={userData}
          cartCount={cartCount}
          products={products}
          categories={categories}
          bundles={bundles}
          loading={loading}
          error={error}
        />
      )}
    </>
  );
}
