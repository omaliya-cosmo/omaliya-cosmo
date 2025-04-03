'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Update interface to match your database structure
interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  priceLKR?: number;
  priceUSD?: number;
  imageUrls?: string[]; // From your schema
  image?: string;       // Fallback for old structure
  categoryId: string;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  discountPercentage?: number;
  stock?: number;
}

interface ProductCardProps {
  product: Product;
  categoryName: string;
  addToCart: (product: Product) => Promise<void>;
  country: string;
}

export default function ProductCard({ 
  product, 
  categoryName, 
  addToCart,
  country
}: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Get price based on country
  const price = country === 'LK' ? 
    product.priceLKR || (product.price?.lkr) || 0 : 
    product.priceUSD || (product.price?.usd) || 0;
    
  const currencySymbol = country === 'LK' ? 'Rs. ' : '$';
  
  // Get image - handle both old and new data structures
  const imageUrl = product.imageUrls?.[0] || product.image || '/images/product-placeholder.jpg';
  
  // Handle add to cart with loading state
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      await addToCart(product);
    } catch (error) {
      console.error('Error adding to cart:', error);
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
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 6; // Max 6 degrees
    const rotateX = ((centerY - e.clientY) / (rect.height / 2)) * 6; // Max 6 degrees
    
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
    const rating = product.rating || 4.5; // Default to 4.5 if no rating provided
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i} 
            className={`w-4 h-4 ${i < fullStars ? 'text-yellow-300' : 'text-gray-200'}`} 
            aria-hidden="true" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="currentColor" 
            viewBox="0 0 22 20"
          >
            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
          </svg>
        ))}
      </div>
    );
  };

  return (
    <Link href={`/products/${product.id}`}>
      <motion.div 
        ref={cardRef}
        className="relative w-full group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 h-full flex flex-col hover:shadow-md transition-shadow duration-300"
        whileHover={{ y: -5 }}
        style={{ 
          perspective: '1000px',
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Product Image with badges */}
        <div className="relative h-0 pb-[100%]">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
            onError={(e) => {
              // Fallback for image errors
              const target = e.target as HTMLImageElement;
              target.src = '/images/product-placeholder.jpg';
            }}
          />
          
          {/* Badges container */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-md">
                New
              </span>
            )}
            
            {product.isBestSeller && (
              <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-md">
                Best Seller
              </span>
            )}
            
            {product.isOnSale && product.discountPercentage && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-md">
                {product.discountPercentage}% Off
              </span>
            )}
          </div>
          
          {/* Out of stock overlay */}
          {(product.stock !== undefined && product.stock <= 0) && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        
        {/* Product details */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="text-xs text-purple-600 font-medium mb-1">
            {categoryName}
          </div>
          
          <h3 className="text-gray-800 font-medium line-clamp-1 mb-1">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-gray-500 text-sm line-clamp-2 mb-2 flex-grow">
              {product.description}
            </p>
          )}
          
          <div className="mt-auto pt-2 flex items-center justify-between">
            <div className="flex items-end">
              <span className="text-gray-900 font-bold">
                {currencySymbol}{price.toFixed(2)}
              </span>
              
              {product.isOnSale && product.discountPercentage && (
                <span className="text-gray-400 text-sm line-through ml-2">
                  {currencySymbol}{(price * (100 / (100 - product.discountPercentage))).toFixed(2)}
                </span>
              )}
            </div>
            
            <button
              className={`flex items-center justify-center p-2 rounded-full ${
                isAddingToCart 
                  ? 'bg-gray-200 text-gray-500' 
                  : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
              } transition-colors`}
              onClick={handleAddToCart}
              disabled={isAddingToCart || (product.stock !== undefined && product.stock <= 0)}
              aria-label="Add to cart"
            >
              {isAddingToCart ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              )}
            </button>
          </div>
          
          {/* Rating - if available */}
          {product.rating !== undefined && (
            <div className="mt-2 flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              {product.reviewCount !== undefined && (
                <span className="text-xs text-gray-500 ml-1">
                  ({product.reviewCount})
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Light reflection effect */}
        <div 
          className={`absolute inset-0 rounded-lg transition-opacity duration-300 pointer-events-none ${isHovered ? 'opacity-30' : 'opacity-0'}`}
          style={{ 
            background: 'linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.8) 50%, transparent 80%)',
            transform: `translateZ(60px) rotateY(${-rotation.y * 1.5}deg)`,
          }}
        ></div>
        
        {/* Add CSS for 3D effects */}
        <style jsx global>{`
          .group:hover {
            z-index: 10;
          }
          
          /* Fix for Safari */
          @media not all and (min-resolution:.001dpcm) { 
            @supports (-webkit-appearance:none) and (stroke-color:transparent) {
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
            animation: shine 1s forwards;
          }
        `}</style>
      </motion.div>
    </Link>
  );
}