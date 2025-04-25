"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBagIcon,
  HeartIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolidIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { Product, ProductCategory, Review } from "@prisma/client";
import { motion } from "framer-motion";

interface ProductWithDetails extends Product {
  category: ProductCategory;
  reviews: Review[];
}

interface ProductCardProps {
  product: ProductWithDetails;
  country: string;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  onQuickView?: (productId: string) => void;
  isWishlisted?: boolean;
}

export default function ProductCard({
  product,
  country,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  isWishlisted = false,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get the correct price based on country
  const regularPrice = country === "LK" ? product.priceLKR : product.priceUSD;
  const discountedPrice =
    country === "LK" ? product.discountPriceLKR : product.discountPriceUSD;
  const currencySymbol = country === "LK" ? "Rs." : "$";

  // Check if product is on discount
  const isDiscounted = discountedPrice !== null;
  const displayPrice = isDiscounted ? discountedPrice : regularPrice;

  // Calculate discount percentage
  const discountPercentage =
    isDiscounted && regularPrice
      ? Math.round(((regularPrice - discountedPrice!) / regularPrice) * 100)
      : 0;

  // Calculate average rating
  const averageRating = product.reviews?.length
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
      product.reviews.length
    : 0;

  // Handlers for user actions
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAddToCart) onAddToCart(product.id);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onToggleWishlist) onToggleWishlist(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onQuickView) onQuickView(product.id);
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="rounded-lg bg-white shadow-sm overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-md h-full flex flex-col">
          {/* Product image */}
          <div className="relative h-48 bg-gray-100">
            {product.imageUrls && product.imageUrls.length > 0 ? (
              <Image
                src={product.imageUrls[0]}
                alt={product.name}
                fill
                className="object-contain p-2"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isDiscounted && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {discountPercentage}% OFF
                </span>
              )}
              {product.stock <= 0 && (
                <span className="bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div
              className={`absolute top-2 right-2 flex flex-col gap-2 transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Wishlist button */}
              <button
                onClick={handleToggleWishlist}
                className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
              >
                {isWishlisted ? (
                  <HeartSolidIcon className="w-4 h-4 text-red-500" />
                ) : (
                  <HeartIcon className="w-4 h-4" />
                )}
              </button>

              {/* Quick view button */}
              <button
                onClick={handleQuickView}
                className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product info */}
          <div className="p-4 flex flex-col flex-grow">
            {/* Category */}
            <span className="text-xs text-gray-500 mb-1">
              {product.category?.name || "Uncategorized"}
            </span>

            {/* Product name */}
            <h3 className="font-medium text-sm text-gray-900 line-clamp-2">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center mt-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(averageRating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-1 text-xs text-gray-500">
                ({product.reviews?.length || 0})
              </span>
            </div>

            {/* Price */}
            <div className="mt-auto flex items-center">
              <span className="text-lg font-bold text-gray-900">
                {currencySymbol}
                {displayPrice?.toFixed(2)}
              </span>

              {isDiscounted && (
                <span className="ml-2 text-xs text-gray-500 line-through">
                  {currencySymbol}
                  {regularPrice?.toFixed(2)}
                </span>
              )}
            </div>

            {/* Add to cart button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`mt-3 w-full py-2 px-4 rounded text-sm font-medium 
                ${
                  product.stock > 0
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? (
                <div className="flex items-center justify-center">
                  <ShoppingBagIcon className="w-4 h-4 mr-2" />
                  Add to Cart
                </div>
              ) : (
                "Out of Stock"
              )}
            </motion.button>
          </div>
        </div>
      </Link>
    </div>
  );
}
