"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import ProductCard from "@/components/shared/ProductCard";

interface Product {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  priceLKR: number;
  priceUSD: number;
  stock: number;
  discount?: number;
  tags: string[];
}

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
}

export default function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        // In a real app, you would fetch related products based on the category
        const response = await axios.get(`/api/products?categoryId=${categoryId}&limit=4`);
        // Filter out the current product
        const filtered = response.data.products.filter((product: Product) => product.id !== currentProductId);
        setRelatedProducts(filtered.slice(0, 3)); // Get up to 3 products
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoading(false);
      }
    }

    if (categoryId) {
      fetchRelatedProducts();
    }
  }, [categoryId, currentProductId]);

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (loading) {
    // Loading skeleton
    return (
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden border border-gray-100 shadow-sm">
              <div className="aspect-square bg-gray-100 animate-pulse" />
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-full mb-2 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-4/5 mb-4 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null; // Don't show section if no related products
  }

  return (
    <div className="mb-16">
      {/* Section heading with gradient */}
      <div className="flex justify-between items-center mb-6">
        <motion.h2
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-pink-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          You May Also Like
        </motion.h2>
        <Link
          href="/products"
          className="text-purple-600 hover:text-pink-600 font-medium text-sm transition-colors"
        >
          View All Products
        </Link>
      </div>

      {/* Decorative line with gradient */}
      <div className="h-0.5 w-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-8"></div>

      {/* Related products grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {relatedProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            currency="LKR"
            currencySymbol="Rs."
            index={index}
          />
        ))}
      </motion.div>
    </div>
  );
}