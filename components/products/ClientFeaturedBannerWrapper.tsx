'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import FeaturedProducts from '@/components/home/FeaturedProducts';

interface ClientFeaturedBannerWrapperProps {
  country: string;
}

export default function ClientFeaturedBannerWrapper({
  country
}: ClientFeaturedBannerWrapperProps) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Get the products from your API
    axios
      .get('/api/products?pageSize=8&sort=newest')
      .then((res) => {
        // Map the API response to match the expected format
        const formattedProducts = res.data.products.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: {
            usd: product.priceUSD,
            lkr: product.priceLKR
          },
          priceLKR: product.priceLKR,
          priceUSD: product.priceUSD,
          image: product.imageUrls?.[0] || '',
          imageUrls: product.imageUrls || [],
          categoryId: product.categoryId,
          rating: product.rating,
          reviewCount: product.reviewCount,
          stock: product.stock,
          isNew: true, // You might want to determine this dynamically
          isBestSeller: product.isBestSeller || false,
          isOnSale: false // Update based on your data
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
      .get('/api/categories')
      .then((res) => {
        setCategories(res.data.categories);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  }, []);

  const handleAddToCart = async (product) => {
    try {
      await axios.post("/api/cart", {
        productId: product.id,
        quantity: 1,
      });

      toast.success(`Added ${product.name} to your cart!`, {
        position: "bottom-right",
        autoClose: 3000,
      });
      
      return Promise.resolve();
    } catch (error) {
      toast.error(error.message || "Error adding to cart", {
        position: "bottom-right",
      });
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