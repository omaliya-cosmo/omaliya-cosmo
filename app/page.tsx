"use client";

import { useState, useEffect } from "react";
import { getCustomerFromToken } from "./actions";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useCountry } from "@/app/lib/hooks/useCountry";

// Imported Components
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BenefitsBanner from "@/components/home/BenefitsBanner";
import FeaturedCollection from "@/components/home/FeaturedCollection";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";
import ProductsSorting from "@/components/products/ProductsSorting"; // Use direct component

export default function Home() {
  const [userData, setUserData] = useState<any>(null);
  const { country, updateCountry } = useCountry();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [sort, setSort] = useState("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchAdmin = async () => {
      const userData = await getCustomerFromToken();
      setUserData(userData);
    };
    fetchAdmin();
  }, []);

  useEffect(() => {
    // Load saved view mode from localStorage if available
    const savedViewMode = localStorage.getItem("productViewMode");
    if (savedViewMode === "grid" || savedViewMode === "list") {
      setViewMode(savedViewMode);
    }

    // Fetch products data
    axios
      .get(`/api/products${sort !== "default" ? `?sort=${sort}` : ""}`)

      .then((res) => {
        setProducts(res.data.products);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // Fetch categories data
    axios
      .get("/api/categories")
      .then((res) => {
        setCategories(res.data.categories);
      })
      .catch((err) => {
        setError(err.message);
      });

    // Fetch actual cart data
    fetchCartData();
  }, [sort]); // Re-fetch when sort changes

  const fetchCartData = async () => {
    try {
      const res = await axios.get("/api/cart");
      const data = res.data;
      const totalItems =
        data.items?.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        ) || 0;

      setCartCount(totalItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  interface Product {
    id: string;
    name: string;
  }

  const addToCart = async (product: Product) => {
    if (
      !product ||
      typeof product.id !== "string" ||
      typeof product.name !== "string"
    ) {
      toast.error("Invalid product details", {
        position: "bottom-right",
      });
      return;
    }

    try {
      await axios.post("/api/cart", {
        productId: product.id,
        quantity: 1,
      });

      setCartCount((prev) => prev + 1);
      toast.success(`Added ${product.name} to your cart!`, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error adding to cart";
      toast.error(errorMessage, {
        position: "bottom-right",
      });
    }
  };

  // Local handlers for sorting and view mode
  const handleSortChange = (newSort: string) => {
    setSort(newSort);
  };

  const handleViewModeChange = (newMode: "grid" | "list") => {
    setViewMode(newMode);
    localStorage.setItem("productViewMode", newMode);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ToastContainer />

      <Header userData={userData} cartCount={cartCount} />

      <main className="flex-grow">
        <HeroSection />

        <CategoriesSection />

        <div className="container mx-auto px-4 my-8">
          <div className="flex justify-end mb-6">
            <ProductsSorting
              currentSort={sort}
              viewMode={viewMode}
              onSortChange={handleSortChange}
              onViewModeChange={handleViewModeChange}
            />
          </div>
        </div>

        <FeaturedProducts
          products={products}
          loading={loading}
          error={error}
          categories={categories}
          addToCart={addToCart}
          country={country || ""}
          viewMode={viewMode}
        />

        <BenefitsBanner />

        <FeaturedCollection />

        <Testimonials />

        <Newsletter />
      </main>

      <Footer />
    </div>
  );
}
