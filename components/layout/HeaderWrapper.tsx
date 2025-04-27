"use client";

import { useState, useEffect } from "react";
import Header from "./Header";
import { usePathname } from "next/navigation";
import axios from "axios";
import { getCustomerFromToken } from "@/app/actions";
import { useCart } from "@/app/lib/hooks/CartContext";
import { useUser } from "@/app/lib/hooks/UserContext";

export default function HeaderWrapper() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bundles, setBundles] = useState([]);
  const pathname = usePathname();

  // Use our cart context instead of local state
  const { cartCount } = useCart();
  const { userData, reloadUserData, isLoading } = useUser();

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
  const isLogin =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isPasswordReset = pathname.startsWith("/password-reset");

  // Return the Header component with all required props
  return (
    <>
      {!isAdmin && !isLogin && !isPasswordReset && (
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
