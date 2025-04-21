"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Product as PrismaProduct,
  ProductCategory,
  Review,
} from "@prisma/client";
import { ShoppingBag, Heart, Star } from "lucide-react";

interface Product extends PrismaProduct {
  reviews?: Review[];
}

interface ProductCardProps {
  product: Product;
  categoryName: string;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  country: string;
  index?: number; // Added optional index property
}

export default function ProductCard({
  product,
  categoryName,
  addToCart,
  country,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Function to render star rating
  const renderStars = () => {
    // Calculate average rating
    const avgRating =
      product.reviews && product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
        : 0;
    const fullStars = Math.floor(avgRating);
    const hasHalfStar = avgRating % 1 >= 0.5;

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            // Full star
            return (
              <Star
                key={i}
                className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
              />
            );
          } else if (i === fullStars && hasHalfStar) {
            // Half star - uses CSS for half fill
            return (
              <div key={i} className="relative">
                <Star className="h-3.5 w-3.5 text-gray-300" />
                <Star
                  className="absolute top-0 left-0 h-3.5 w-3.5 fill-amber-400 text-amber-400 overflow-hidden"
                  style={{ clipPath: "inset(0 50% 0 0)" }}
                />
              </div>
            );
          } else {
            // Empty star
            return <Star key={i} className="h-3.5 w-3.5 text-gray-300" />;
          }
        })}
        {product.reviews && product.reviews.length > 0 && (
          <span className="ml-1 text-xs text-gray-500">
            ({product.reviews.length})
          </span>
        )}
      </div>
    );
  };

  // Handle add to cart with animation
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) return;

    setIsAddingToCart(true);

    try {
      await addToCart(product);
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 1000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setIsAddingToCart(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 h-full flex flex-col group-hover:shadow-md">
          {/* Product image */}
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            {product.imageUrls && product.imageUrls.length > 0 ? (
              <Image
                src={product.imageUrls[0]}
                alt={product.name}
                fill
                className={`object-cover transition-transform duration-500 ${
                  isHovered ? "scale-110" : "scale-100"
                } ${!isImageLoaded ? "opacity-0" : "opacity-100"}`}
                onLoadingComplete={() => setIsImageLoaded(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
            )}

            {/* Sale badges if discounted */}
            {((country === "LK" && product.discountPriceLKR) ||
              (country !== "LK" && product.discountPriceUSD)) && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                {country === "LK" &&
                product.discountPriceLKR &&
                product.priceLKR
                  ? `-${Math.round(
                      ((product.priceLKR - product.discountPriceLKR) /
                        product.priceLKR) *
                        100
                    )}%`
                  : country !== "LK" &&
                    product.discountPriceUSD &&
                    product.priceUSD
                  ? `-${Math.round(
                      ((product.priceUSD - product.discountPriceUSD) /
                        product.priceUSD) *
                        100
                    )}%`
                  : "SALE"}
              </div>
            )}

            {/* Out of stock overlay */}
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Product details */}
          <div className="p-5 flex flex-col flex-grow">
            <div className="text-xs text-purple-700 font-semibold mb-1.5 uppercase tracking-wide">
              {categoryName}
            </div>

            <h3 className="text-gray-900 font-medium text-lg mb-1.5 line-clamp-1 group-hover:text-purple-700 transition-colors">
              {product.name}
            </h3>

            <div className="mb-2">{renderStars()}</div>

            <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
              {product.description}
            </p>

            {/* Price display */}
            <div className="mt-auto mb-4">
              <div className="flex items-center">
                <span className="text-lg font-semibold text-gray-900 mr-2">
                  {country === "LK"
                    ? `Rs. ${(
                        product.discountPriceLKR ||
                        product.priceLKR ||
                        0
                      ).toFixed(2)}`
                    : `$${(
                        product.discountPriceUSD ||
                        product.priceUSD ||
                        0
                      ).toFixed(2)}`}
                </span>

                {/* Show original price if discounted */}
                {((country === "LK" && product.discountPriceLKR) ||
                  (country !== "LK" && product.discountPriceUSD)) && (
                  <span className="text-sm text-gray-500 line-through">
                    {country === "LK"
                      ? `Rs. ${product.priceLKR?.toFixed(2)}`
                      : `$${product.priceUSD?.toFixed(2)}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Add to cart button - positioned on top of card */}
      <div
        className={`absolute bottom-4 right-4 transition-all duration-300 ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || isAddingToCart}
          className={`${
            isAddingToCart
              ? "bg-green-600 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          } rounded-full p-3 shadow-md transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed`}
        >
          {isAddingToCart ? (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <ShoppingBag className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
