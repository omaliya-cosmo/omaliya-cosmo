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
import FeaturedBundles from "@/components/home/FeaturedBundles";
import SocialMediaFeed from "@/components/home/SocialMediaFeed"; // Import the new component
import { useCart } from "./lib/context/CartContext";

export default function Home() {
  const { country, updateCountry } = useCountry();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bundleoffers, setBundleoffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use our cart context to refresh cart data
  const { refreshCart } = useCart();

  useEffect(() => {
    // Fetch products data
    axios
      .get("/api/products")
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
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // Fetch bundle offers data
    axios
      .get("/api/bundleoffers")
      .then((res) => {
        console.log("bundle", res.data);
        setBundleoffers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  interface CartProduct {
    id: string;
    name: string;
  }

  const addToCart = async (product: CartProduct) => {
    try {
      await axios.post("/api/cart", {
        productId: product.id,
        quantity: 1,
      });

      // Refresh cart data in the context
      await refreshCart();

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
        </div>
      </main>
    </div>
  );
}
