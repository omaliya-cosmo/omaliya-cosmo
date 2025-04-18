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
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";
import FeaturedBundles from "@/components/home/FeaturedBundles";
import SocialMediaFeed from "@/components/home/SocialMediaFeed"; // Import the new component

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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ToastContainer />

      <Header userData={userData} cartCount={cartCount} />

      <main className="flex-col ">
        <HeroSection />

        <div className="bg-white">
          <CategoriesSection />

          <div className="bg-white">
            <FeaturedProducts
              products={products}
              loading={loading}
              error={error}
              categories={categories}
              addToCart={addToCart}
              country={country || ""}
              viewMode={viewMode}
            />
          </div>

          <div className="bg-white">
            <FeaturedBundles />
          </div>

          <div className="bg-white">
            <BenefitsBanner />
          </div>

          <div className="bg-white">
            <SocialMediaFeed />
          </div>

          <div className="bg-white">
            <Testimonials />
          </div>

          <div className="bg-white">
            <Newsletter />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
