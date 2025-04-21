"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import FeaturedProducts from "@/components/home/FeaturedProducts";

interface ClientFeaturedBannerWrapperProps {
  country: string;
}

export default function ClientFeaturedBannerWrapper({
  country,
}: ClientFeaturedBannerWrapperProps) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Get the products from your API
    axios
      .get("/api/products?pageSize=8&sort=newest")
      .then((res) => {
        // Map the API response to match the expected format
        const formattedProducts = res.data.products.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: {
            usd: product.priceUSD,
            lkr: product.priceLKR,
          },
          priceLKR: product.priceLKR,
          priceUSD: product.priceUSD,
          image: product.imageUrls?.[0] || "",
          imageUrls: product.imageUrls || [],
          categoryId: product.categoryId,
          rating: product.rating,
          reviewCount: product.reviewCount,
          stock: product.stock,
          isNew: true, // You might want to determine this dynamically
          isBestSeller: product.isBestSeller || false,
          isOnSale: false, // Update based on your data
          discountPriceLKR: product.discountPriceLKR,
          discountPriceUSD: product.discountPriceUSD,
        }));

        setProducts(formattedProducts);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // Fetch categories
    axios
      .get("/api/categories")
      .then((res) => {
        setCategories(res.data.categories);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  }, []);

  const handleAddToCart = async (product) => {
    try {
      // Get current cart from localStorage
      const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");

      // Check if product already exists in cart
      const existingProductIndex = currentCart.findIndex(
        (item) => item.id === product.id
      );

      if (existingProductIndex >= 0) {
        // Update quantity if product exists
        currentCart[existingProductIndex].quantity += 1;
      } else {
        // Add new product to cart
        currentCart.push({
          id: product.id,
          name: product.name,
          price:
            country === "LK"
              ? product.discountPriceLKR || product.priceLKR
              : product.discountPriceUSD || product.priceUSD,
          image: product.imageUrls?.[0] || "",
          quantity: 1,
        });
      }

      // Save updated cart to localStorage
      localStorage.setItem("cart", JSON.stringify(currentCart));

      // Create a custom event to notify other components about cart update
      const event = new StorageEvent("storage", {
        key: "cart",
        newValue: JSON.stringify(currentCart),
      });
      window.dispatchEvent(event);

      toast.success(`Added ${product.name} to your cart!`);

      return Promise.resolve();
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Error adding to cart");
      return Promise.reject(error);
    }
  };

  return (
    <FeaturedProducts
      products={products}
      loading={loading}
      error={error}
      categories={categories}
      addToCart={handleAddToCart}
      country={country}
    />
  );
}
