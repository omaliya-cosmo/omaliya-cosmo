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

  // Fetch all header data in a single API call
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Use the new consolidated header API endpoint
        const response = await axios.get("/api/header");
        const data = response.data;

        // Extract data from the response
        setProducts(data.products || []);
        setCategories(data.categories || []);
        setBundles(data.bundles || []);

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
