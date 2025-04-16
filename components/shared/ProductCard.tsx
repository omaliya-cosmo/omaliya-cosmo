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

interface Product extends PrismaProduct {
  category?: ProductCategory;
  reviews?: Review[]; 
  discountPriceLKR?: number; 
  discountPriceUSD?: number; 
}

interface ProductCardProps {
  product: Product;
  categoryName: string;
  addToCart: (product: Product) => Promise<void>;
  currency: string;
  currencySymbol: string; 
  country: string;
  index?: number; // Added optional index property
}

export default function ProductCard({
  product,
  categoryName,
  addToCart,
  country,
}: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  // Update price calculation
  const price = country === "LK" ? product.priceLKR : product.priceUSD;
  const discountPrice =
    country === "LK" ? product.discountPriceLKR : product.discountPriceUSD;
  const currencySymbol = country === "LK" ? "Rs. " : "$";

  // Update image handling - now we always have imageUrls array
  const imageUrl =
    product.imageUrls[0] || "https://picsum.photos/id/237/300/300";

  // Calculate discount percentage if discount price exists
  const discountPercentage = discountPrice
    ? Math.round(((price - discountPrice) / price) * 100)
    : null;

  // Handle add to cart with loading state
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      await addToCart(product);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Calculate rotation based on mouse position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    // Calculate the center of the card
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate distance from cursor to center (as percentage of dimensions)
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 8; // Increased to 8 degrees
    const rotateX = ((centerY - e.clientY) / (rect.height / 2)) * 8; // Increased to 8 degrees

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  // Generate star rating elements
  const renderStars = () => {
    // Calculate average rating from reviews
    const averageRating =
      product.reviews && product.reviews.length > 0
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
          product.reviews.length
        : 0;

    const rating = averageRating < 3 ? 3 : averageRating || 0; // Make rating 3 if less than 3
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${
              i < fullStars 
                ? "text-amber-400" 
                : i === fullStars && hasHalfStar 
                  ? "text-gradient-star"
                  : "text-gray-200"
            }`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 22 20"
          >
            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
          </svg>
        ))}
        {product.reviews && product.reviews.length > 0 && (
          <span className="text-xs text-gray-500 font-medium">
            ({product.reviews.length})
          </span>
        )}
      </div>
    );
  };

  return (
    <Link href={`/products/${product.id}`}>
      <motion.div
        ref={cardRef}
        className="relative w-full group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 h-full flex flex-col hover:shadow-lg transition-all duration-300"
        whileHover={{ 
          y: -8, 
          transition: { type: "spring", stiffness: 300, damping: 15 } 
        }}
        style={{
          perspective: "1200px",
          transformStyle: "preserve-3d",
          transform: isHovered ? `rotateY(${rotation.y}deg) rotateX(${rotation.x}deg)` : "none",
          transition: "transform 0.2s ease-out",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Product Image with badges */}
        <div className="relative h-0 pb-[100%] overflow-hidden bg-gray-50">
          <motion.div
            className="absolute inset-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/product-placeholder.jpg";
              }}
            />
          </motion.div>

          {/* Badges container */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {/* Show discount badge if discount price exists */}
            {discountPercentage && (
              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                {discountPercentage}% OFF
              </span>
            )}
            
            {/* Low stock indicator */}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
                Only {product.stock} left
              </span>
            )}
          </div>

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
          
          <div className="mb-2">
            {renderStars()}
          </div>

          <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
            {product.description}
          </p>

          <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100">
            <div className="flex items-end">
              <span className="text-gray-900 font-bold text-lg">
                {currencySymbol}
                {discountPrice?.toFixed(2) || price.toFixed(2)}
              </span>

              {discountPrice && (
                <span className="text-gray-400 text-sm line-through ml-2">
                  {currencySymbol}
                  {price.toFixed(2)}
                </span>
              )}
            </div>

            <button
              className={`flex items-center justify-center p-2.5 rounded-full ${
                isAddingToCart
                  ? "bg-gray-200 text-gray-500"
                  : product.stock <= 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white transform hover:scale-105"
              } transition-all duration-200 shadow-sm`}
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock <= 0}
              aria-label="Add to cart"
            >
              {isAddingToCart ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  ></path>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Light reflection effect */}
        <div
          className={`absolute inset-0 rounded-xl transition-opacity duration-500 pointer-events-none ${
            isHovered ? "opacity-40" : "opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.9) 50%, transparent 80%)",
            transform: `translateZ(60px) rotateY(${-rotation.y * 1.8}deg)`,
          }}
        ></div>

        {/* Add CSS for 3D effects and animations */}
        <style jsx global>{`
          .group:hover {
            z-index: 10;
          }
          
          .text-gradient-star {
            background: linear-gradient(to right, #fbbf24 0%, #fbbf24 50%, #e5e7eb 50%, #e5e7eb 100%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }

          @media not all and (min-resolution: 0.001dpcm) {
            @supports (-webkit-appearance: none) and (stroke-color: transparent) {
              .group > div {
                transform: translateZ(0);
                backface-visibility: hidden;
              }
            }
          }

          @keyframes shine {
            from {
              transform: translateX(-100%) rotate(20deg);
              opacity: 0;
            }
            50% {
              opacity: 0.5;
            }
            to {
              transform: translateX(100%) rotate(20deg);
              opacity: 0;
            }
          }

          .group:hover .group-hover\\:animate-shine {
            animation: shine 1.5s forwards;
          }
        `}</style>
      </motion.div>
    </Link>
  );
}