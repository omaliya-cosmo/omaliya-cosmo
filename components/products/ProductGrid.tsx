"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ProductCategory,
  Product as PrismaProduct,
  Review,
} from "@prisma/client";
import { 
  ShoppingBagIcon, 
  HeartIcon, 
  ArrowsUpDownIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  EyeIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { useInView } from "react-intersection-observer";

interface Product extends PrismaProduct {
  category?: ProductCategory; 
  reviews?: Review[]; 
  discountPriceLKR?: number;
  discountPriceUSD?: number;
  createdAt: string; // Add createdAt property
}

interface ProductGridProps {
  products: Product[];
  currency: string;
  currencySymbol: string;
  viewMode: "grid" | "list";
  onAddToCart?: (productId: string) => void;
  isLoading?: boolean;
}

export default function ProductGrid({
  products,
  currency,
  currencySymbol,
  viewMode,
  onAddToCart,
  isLoading = false,
}: ProductGridProps) {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  
  // Pagination logic
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // Grid layout animation references
  const gridRef = useRef<HTMLDivElement>(null);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });
  
  // Load more items when scrolling to the bottom
  useEffect(() => {
    if (inView && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [inView, currentPage, totalPages]);

  // Toggle wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    
    // Show notification
    const product = products.find(p => p.id === productId);
    if (product) {
      const isAdding = !wishlist.includes(productId);
      showNotification({
        type: isAdding ? "success" : "info",
        message: isAdding 
          ? `${product.name} added to wishlist` 
          : `${product.name} removed from wishlist`,
      });
    }
  };
  
  // Compare products
  const toggleCompare = (product: Product) => {
    setCompareProducts(prev => {
      const isAlreadyComparing = prev.some(p => p.id === product.id);
      
      if (isAlreadyComparing) {
        return prev.filter(p => p.id !== product.id);
      } else if (prev.length < 3) {
        return [...prev, product];
      } else {
        // Show max compare notification
        showNotification({
          type: "warning",
          message: "You can compare up to 3 products at a time",
        });
        return prev;
      }
    });
  };
  
  // Show notification
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);
  
  const showNotification = (config: { type: "success" | "error" | "info" | "warning"; message: string }) => {
    setNotification(config);
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter and sort products
  const sortedProducts = useMemo(() => {
    if (isLoading) return Array(6).fill({} as Product);
    
    let sorted = [...products];
    
    switch (sortBy) {
      case "price-low":
        sorted = sorted.sort((a, b) => {
          const priceA = currency === "LKR" ? (a.discountPriceLKR || a.priceLKR || 0) : (a.discountPriceUSD || a.priceUSD || 0);
          const priceB = currency === "LKR" ? (b.discountPriceLKR || b.priceLKR || 0) : (b.discountPriceUSD || b.priceUSD || 0);
          return priceA - priceB;
        });
        break;
      case "price-high":
        sorted = sorted.sort((a, b) => {
          const priceA = currency === "LKR" ? (a.discountPriceLKR || a.priceLKR || 0) : (a.discountPriceUSD || a.priceUSD || 0);
          const priceB = currency === "LKR" ? (b.discountPriceLKR || b.priceLKR || 0) : (b.discountPriceUSD || b.priceUSD || 0);
          return priceB - priceA;
        });
        break;
      case "rating":
        sorted = sorted.sort((a, b) => {
          const ratingA = a.reviews?.length ? a.reviews.reduce((sum, review) => sum + review.rating, 0) / a.reviews.length : 0;
          const ratingB = b.reviews?.length ? b.reviews.reduce((sum, review) => sum + review.rating, 0) / b.reviews.length : 0;
          return ratingB - ratingA;
        });
        break;
      case "newest":
        sorted = sorted.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;
      case "discount":
        sorted = sorted.sort((a, b) => {
          const discountA = currency === "LKR" 
            ? ((a.discountPriceLKR && a.priceLKR) ? (a.priceLKR - a.discountPriceLKR) / a.priceLKR : 0)
            : ((a.discountPriceUSD && a.priceUSD) ? (a.priceUSD - a.discountPriceUSD) / a.priceUSD : 0);
            
          const discountB = currency === "LKR"
            ? ((b.discountPriceLKR && b.priceLKR) ? (b.priceLKR - b.discountPriceLKR) / b.priceLKR : 0)
            : ((b.discountPriceUSD && b.priceUSD) ? (b.priceUSD - b.discountPriceUSD) / b.priceUSD : 0);
          
          return discountB - discountA;
        });
        break;
      default: // featured or any other case
        break;
    }
    
    return sorted.slice(0, currentPage * itemsPerPage);
  }, [products, sortBy, currency, isLoading, currentPage, itemsPerPage]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24 
      } 
    }
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Sort and Filter Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header section with stacked layout on mobile */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 gap-3">
          <div className="flex items-center space-x-2">
            <ArrowPathIcon className="h-4 w-4 flex-shrink-0 text-purple-600" />
            <div className="text-sm text-gray-700 font-medium">
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading products...
                </span>
              ) : (
                <span className="whitespace-normal sm:whitespace-nowrap">
                  Showing <span className="text-purple-700 font-semibold">{Math.min(sortedProducts.length, products.length)}</span> of <span className="text-purple-700 font-semibold">{products.length}</span> products
                </span>
              )}
            </div>
          </div>

          {/* Controls container - full width on mobile */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex flex-1 sm:flex-none items-center justify-center sm:justify-start space-x-1 text-sm font-medium bg-white px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 text-purple-600" />
              <span>Filter</span>
            </button>
            
            {/* Sort dropdown - full width on mobile */}
            <div className="flex items-center flex-1 sm:flex-none space-x-1 sm:border-l sm:border-gray-200 sm:pl-3">
              <ArrowsUpDownIcon className="h-4 w-4 text-purple-600 hidden sm:block" />
              <div className="relative w-full sm:w-auto">
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg py-2 pl-3 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none shadow-sm"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Best Rating</option>
                  <option value="newest">Newest</option>
                  <option value="discount">Biggest Discount</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* View switcher can be added here if needed */}
          </div>
        </div>
        
        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-100 overflow-hidden"
            >
              <div className="p-4 bg-gray-50/80 backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Price Range Filter */}
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
                    {/* Add price range slider here */}
                    <div className="flex items-center space-x-4">
                      <input 
                        type="range" 
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>
                  </div>

                  {/* Category Filter - Improved for mobile */}
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                      {["All", "Electronics", "Clothing", "Home & Kitchen", "Beauty", "Toys"].map(category => (
                        <div key={category} className="flex items-center">
                          <input
                            id={`category-${category}`}
                            type="checkbox"
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <label htmlFor={`category-${category}`} className="ml-2 text-xs sm:text-sm text-gray-700">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rating Filter - Improved for mobile */}
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Rating</h4>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map(star => (
                        <div key={star} className="flex items-center">
                          <input
                            id={`rating-${star}`}
                            type="checkbox"
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <label htmlFor={`rating-${star}`} className="ml-2 text-xs sm:text-sm flex items-center text-gray-700">
                            {[...Array(5)].map((_, i) => (
                              <svg 
                                key={i} 
                                className={`w-3 h-3 ${i < star ? "text-amber-400" : "text-gray-300"}`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="ml-1">{star}+ Stars</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Filter actions - Made more touch-friendly */}
                <div className="mt-4 flex justify-end gap-3">
                  <button className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors">
                    Reset All
                  </button>
                  <button className="px-4 py-2 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Compare Products Bar */}
      <AnimatePresence>
        {compareProducts.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-3"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-800">
                Compare Products ({compareProducts.length}/3)
              </h3>
              <button 
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setCompareProducts([])}
              >
                Clear All
              </button>
            </div>
            
            <div className="flex items-stretch space-x-3">
              {compareProducts.map(product => (
                <div key={product.id} className="relative flex-1 bg-gray-50 p-2 rounded-lg">
                  <button 
                    className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-200"
                    onClick={() => toggleCompare(product)}
                  >
                    <XMarkIcon className="w-3 h-3 text-gray-500" />
                  </button>
                  <div className="flex items-center space-x-2">
                    <div className="relative w-10 h-10 bg-gray-100 rounded">
                      {product.imageUrls?.[0] && (
                        <Image
                          src={product.imageUrls[0]}
                          alt={product.name}
                          fill
                          className="object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-800 line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        {currencySymbol}
                        {(currency === "LKR" 
                          ? (product.discountPriceLKR || product.priceLKR) 
                          : (product.discountPriceUSD || product.priceUSD)
                        )?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {[...Array(3 - compareProducts.length)].map((_, i) => (
                <div key={i} className="relative flex-1 bg-gray-50 p-2 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
                  <p className="text-xs text-gray-400">Add product</p>
                </div>
              ))}
            </div>
            
            <div className="mt-3 flex justify-end">
              <button className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                Compare Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center px-4 py-3 rounded-lg shadow-lg ${
              notification.type === "success" ? "bg-green-50 text-green-800 border-l-4 border-green-500" :
              notification.type === "error" ? "bg-red-50 text-red-800 border-l-4 border-red-500" :
              notification.type === "warning" ? "bg-amber-50 text-amber-800 border-l-4 border-amber-500" :
              "bg-blue-50 text-blue-800 border-l-4 border-blue-500"
            }`}
          >
            <div className="mr-3">
              {notification.type === "success" && (
                <CheckIcon className="h-5 w-5 text-green-500" />
              )}
              {notification.type === "error" && (
                <XMarkIcon className="h-5 w-5 text-red-500" />
              )}
              {notification.type === "warning" && (
                <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {notification.type === "info" && (
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products grid/list with animation */}
      <div ref={gridRef}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            // Skeleton loading grid with animation
            <motion.div
              className={`
                ${
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "flex flex-col space-y-4"
                }
              `}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {[...Array(6)].map((_, index) => (
                <ProductCardSkeleton key={index} viewMode={viewMode} />
              ))}
            </motion.div>
          ) : sortedProducts.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`
                ${
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "flex flex-col space-y-4"
                }
              `}
            >
              {sortedProducts.map((product) => (
                <motion.div key={product.id} variants={itemVariants} layout>
                  <ProductCard
                    product={product}
                    currency={currency}
                    currencySymbol={currencySymbol}
                    viewMode={viewMode}
                    onAddToCart={onAddToCart}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={() => toggleWishlist(product.id)}
                    onQuickView={() => setQuickViewProduct(product)}
                    isComparing={compareProducts.some(p => p.id === product.id)}
                    onToggleCompare={() => toggleCompare(product)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full py-16 text-center bg-gray-50/70 rounded-xl border border-dashed border-gray-200"
            >
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-6 text-xl font-medium text-gray-900">No products found</h3>
              <p className="mt-2 text-gray-500">Try changing your filters or search term.</p>
              <button className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                Clear Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Load more indicator */}
      {!isLoading && products.length > itemsPerPage && currentPage < totalPages && (
        <div ref={loadMoreRef} className="py-8 flex justify-center">
          <svg className="animate-spin h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      
      {/* Quick view modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={() => setQuickViewProduct(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl overflow-hidden shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <button 
                  className="absolute top-4 right-4 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors z-10"
                  onClick={() => setQuickViewProduct(null)}
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600" />
                </button>
                
                <div className="flex flex-col md:flex-row">
                  {/* Product image */}
                  <div className="md:w-1/2 bg-gray-50 relative">
                    {quickViewProduct.imageUrls && quickViewProduct.imageUrls.length > 0 && (
                      <div className="relative h-70 md:h-full">
                        <Image
                          src={quickViewProduct.imageUrls[0]}
                          alt={quickViewProduct.name}
                          fill
                          className="object-contain p-6"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Product details */}
                  <div className="md:w-1/2 p-6">
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                      {quickViewProduct.category?.name || "Uncategorized"}
                    </span>
                    
                    <h2 className="mt-1 text-xl font-medium text-gray-900">
                      {quickViewProduct.name}
                    </h2>
                    
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => {
                          const rating = quickViewProduct.reviews?.length 
                            ? quickViewProduct.reviews.reduce((sum, review) => sum + review.rating, 0) / quickViewProduct.reviews.length
                            : 0;
                            
                          return (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.round(rating) ? "text-amber-400 fill-current" : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          );
                        })}
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        ({quickViewProduct.reviews?.length || 0} reviews)
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        {quickViewProduct.description}
                      </p>
                    </div>
                    
                    <div className="mt-6 flex items-center">
                      <span className="text-2xl font-bold text-gray-900">
                        {currencySymbol}
                        {(currency === "LKR" 
                          ? quickViewProduct.discountPriceLKR || quickViewProduct.priceLKR
                          : quickViewProduct.discountPriceUSD || quickViewProduct.priceUSD
                        )?.toFixed(2)}
                      </span>
                      
                      {((currency === "LKR" && quickViewProduct.discountPriceLKR) || 
                        (currency === "USD" && quickViewProduct.discountPriceUSD)) && (
                        <span className="ml-3 text-gray-500 text-sm line-through">
                          {currencySymbol}
                          {(currency === "LKR" 
                            ? quickViewProduct.priceLKR
                            : quickViewProduct.priceUSD
                          )?.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        quickViewProduct.stock > 5
                          ? "bg-green-100 text-green-800"
                          : quickViewProduct.stock > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                      }`}>
                        {quickViewProduct.stock > 5
                          ? "In Stock"
                          : quickViewProduct.stock > 0
                            ? `Only ${quickViewProduct.stock} left`
                            : "Out of Stock"
                        }
                      </span>
                      
                      {/* Add to cart button */}
                      {quickViewProduct.stock > 0 && (
                        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                          <button 
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center"
                            onClick={(e) => {
                              e.preventDefault();
                              onAddToCart?.(quickViewProduct.id);
                              showNotification({
                                type: "success",
                                message: `${quickViewProduct.name} added to cart`
                              });
                            }}
                          >
                            <ShoppingBagIcon className="w-4 h-4 mr-2" />
                            Add to Cart
                          </button>
                          
                          <button 
                            className="flex-1 sm:flex-none bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center"
                            onClick={() => {
                              toggleWishlist(quickViewProduct.id);
                              setQuickViewProduct(null);
                            }}
                          >
                            {wishlist.includes(quickViewProduct.id) ? (
                              <>
                                <HeartSolidIcon className="w-4 h-4 mr-2 text-red-500" />
                                Wishlisted
                              </>
                            ) : (
                              <>
                                <HeartIcon className="w-4 h-4 mr-2" />
                                Add to Wishlist
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Enhanced skeleton loading component
function ProductCardSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  return (
    <div 
      className={`animate-pulse bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 ${
        viewMode === "list" ? "flex items-center" : "flex flex-col"
      }`}
    >
      <div
        className={`relative ${
          viewMode === "list" ? "h-36 w-36 md:h-40 md:w-40 flex-shrink-0" : "h-64 w-full"
        } bg-gradient-to-b from-gray-100 to-gray-200`}
      />
      <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""} flex flex-col`}>
        <div className="h-2.5 bg-gray-200 rounded-full mb-2 w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded-full mb-2 w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded-full w-1/2 mb-4"></div>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded-full w-16"></div>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-4 bg-gray-200 rounded-full" />
            ))}
          </div>
        </div>
        {viewMode !== "list" && (
          <div className="mt-3 h-8 bg-gray-200 rounded-full w-full"></div>
        )}
      </div>
    </div>
  );
}

// Update the ProductCardProps interface

interface ProductCardProps {
  product: Product;
  currency: string;
  currencySymbol: string;
  viewMode: "grid" | "list";
  onAddToCart?: (productId: string, quantity?: number) => void;  // Updated to include quantity
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  onQuickView?: () => void;
  isComparing?: boolean;
  onToggleCompare?: () => void;
}

function ProductCard({
  product,
  currency,
  currencySymbol,
  viewMode,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist,
  onQuickView,
  isComparing = false,
  onToggleCompare
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [quantity, setQuantity] = useState(1);

  // Calculate rating properly to avoid hydration mismatch
  const rating = useMemo(() => {
    if (!product.reviews || product.reviews.length === 0) return 0;
    const sum = product.reviews.reduce((total, review) => total + review.rating, 0);
    return Math.round((sum / product.reviews.length) * 10) / 10; // Keep one decimal point
  }, [product.reviews]);

  const displayPrice = useMemo(() => {
    const price = currency === "LKR"
      ? product.discountPriceLKR || product.priceLKR
      : product.discountPriceUSD || product.priceUSD;

    return price ? price.toFixed(2) : "0.00";
  }, [product, currency]);

  // Check if product is on sale
  const isOnSale = product.discountPriceLKR !== null || product.discountPriceUSD !== null;

  // Calculate discount percentage
  const discountPercentage = useMemo(() => {
    if (currency === "LKR" && product.discountPriceLKR && product.priceLKR) {
      return Math.round(((product.priceLKR - product.discountPriceLKR) / product.priceLKR) * 100);
    } else if (currency === "USD" && product.discountPriceUSD && product.priceUSD) {
      return Math.round(((product.priceUSD - product.discountPriceUSD) / product.priceUSD) * 100);
    }
    return 0;
  }, [product, currency]);

  // Handle image zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomed) return;
    
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setMousePosition({ x, y });
    
    // 3D tilt effect
    if (cardRef.current && isHovered) {
      const cardRect = cardRef.current.getBoundingClientRect();
      const centerX = cardRect.width / 2;
      const centerY = cardRect.height / 2;
      const rotateX = ((e.clientY - cardRect.top - centerY) / centerY) * -5;
      const rotateY = ((e.clientX - cardRect.left - centerX) / centerX) * 5;
      setRotation({ x: rotateX, y: rotateY });
    }
  };

  // Multiple images gallery feature
  const handleImageChange = () => {
    if (product.imageUrls && product.imageUrls.length > 1) {
      setImageIndex((prevIndex) => 
        prevIndex === product.imageUrls!.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  // Handle add to cart with animation
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    
    setIsAddingToCart(true);
    
    if (onAddToCart) {
      onAddToCart(product.id, quantity);
    }
    
    // Reset animation after a delay
    setTimeout(() => {
      setIsAddingToCart(false);
      setQuantity(1); // Reset quantity after adding to cart
    }, 1000);
  };

  // Handle quick view
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView();
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist();
    }
  };
  
  // Handle compare toggle
  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleCompare) {
      onToggleCompare();
    }
  };

  // Handle quantity change
  const incrementQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };
  
  const decrementQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div 
      ref={cardRef}
      className="group perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsZoomed(false);
        setRotation({ x: 0, y: 0 });
      }}
    >
      <Link
        href={`/products/${product.id}`}
        className="block h-full outline-none"
        onClick={(e) => product.stock <= 0 && e.preventDefault()}
      >
        <motion.div
          className={`relative h-full ${
            viewMode === "list" 
              ? "flex flex-col sm:flex-row items-start sm:items-center" 
              : "flex flex-col"
          } bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300`}
          style={{
            boxShadow: isHovered 
              ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
              : "0 1px 3px rgba(0, 0, 0, 0.05)",
            transform: isHovered && viewMode !== "list" 
              ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.02, 1.02, 1.02)` 
              : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
          }}
        >
          <div
            ref={imageRef}
            className={`relative ${
              viewMode === "list" 
                ? "h-64 w-full sm:h-36 sm:w-36 md:h-40 md:w-40 sm:flex-shrink-0" 
                : "h-[28rem] w-full md:h-[20rem]"
            } overflow-hidden`}
            onClick={(e) => {
              if (!isZoomed) {
                e.preventDefault();
                handleImageChange();
              }
            }}
            onDoubleClick={(e) => {
              e.preventDefault();
              setIsZoomed(!isZoomed);
            }}
          >
            {product.imageUrls && product.imageUrls.length > 0 && !imageError ? (
              <>
                <motion.div
                  initial={false}
                  animate={{
                    scale: isHovered ? 1.05 : 1
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="h-full w-full"
                  style={isZoomed ? {
                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                    transform: `scale(1.8)`,
                  } : {}}
                >
                  <Image
                    src={product.imageUrls[imageIndex]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-opacity duration-300"
                    onError={() => setImageError(true)}
                    priority={false}
                  />
                </motion.div>
                
                {/* Image gallery dots indicator with improved styling */}
                {product.imageUrls.length > 1 && viewMode === "grid" && !isZoomed && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1.5">
                    {product.imageUrls.map((_, idx) => (
                      <button
                        key={idx}
                        className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                          idx === imageIndex 
                            ? 'bg-white scale-125 shadow-md' 
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          setImageIndex(idx);
                        }}
                        aria-label={`View image ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Zoom instructions */}
                {isHovered && viewMode === "grid" && !isZoomed && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <p className="text-white text-xs text-center">Double-click to zoom</p>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <svg
                  className="w-12 h-12 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}

            {/* Out of stock overlay with improved styling */}
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white/90 text-gray-800 px-4 py-1.5 rounded-full text-sm font-medium shadow-lg transform -rotate-3">
                  Out of Stock
                </div>
              </div>
            )}

            {/* Sale badge with animation */}
            {isOnSale && product.stock > 0 && (
              <div className="absolute top-3 left-3 animate-pulse-subtle">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform -rotate-2">
                  {discountPercentage}% OFF
                </div>
              </div>
            )}

            {/* Low stock indicator with enhanced styling */}
            {product.stock > 0 && product.stock <= 5 && (
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-amber-500/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full text-center shadow-md">
                  Only {product.stock} left
                </div>
              </div>
            )}

            {/* Action buttons container */}
            {viewMode === "grid" && !isZoomed && (
              <div 
                className={`absolute top-3 right-3 flex flex-col space-y-2 transition-all duration-300 ${
                  isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Wishlist button */}
                <motion.button 
                  className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWishlistToggle}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isWishlisted ? (
                    <HeartSolidIcon className="w-4 h-4 text-red-500" />
                  ) : (
                    <HeartIcon className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                  )}
                </motion.button>
                
                {/* Quick view button */}
                <motion.button 
                  className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleQuickView}
                  aria-label="Quick view"
                >
                  <EyeIcon className="w-4 h-4 text-gray-600 hover:text-purple-500 transition-colors" />
                </motion.button>
                
                {/* Compare button */}
                <motion.button 
                  className={`p-2 rounded-full backdrop-blur-sm shadow-md transition-all duration-300 ${
                    isComparing ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-white/90 text-gray-600 hover:bg-white hover:text-purple-500"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCompareToggle}
                  aria-label={isComparing ? "Remove from compare" : "Add to compare"}
                >
                  {isComparing ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  )}
                </motion.button>
              </div>
            )}
            
            {/* Exit zoom button */}
            {isZoomed && (
              <button 
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white backdrop-blur-sm shadow-md"
                onClick={(e) => {
                  e.preventDefault();
                  setIsZoomed(false);
                }}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className={`${viewMode === "list" ? "p-4 sm:p-5 flex-1" : "p-4"} flex flex-col h-full`}>
            {/* Category badge */}
            <div className="mb-1">
              <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-xs font-semibold uppercase tracking-wider">
                {product.category?.name || "Uncategorized"}
              </span>
            </div>

            <h3 className={`font-medium leading-tight ${
              viewMode === "list" ? "text-lg" : "text-sm"
            } text-gray-800 hover:text-purple-700 transition-colors ${
              viewMode === "list" ? "" : "line-clamp-1"
            }`}>
              {product.name}
            </h3>

            {/* Improved rating display */}
            <div className="flex items-center my-1">
              {rating > 0 ? (
                <div className="flex items-center">
                  <div className="flex bg-amber-50 px-1.5 py-0.5 rounded-md">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(rating) ? "text-amber-400 fill-current" : 
                            i === Math.floor(rating) && rating % 1 > 0 ? "text-gradient-star" : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-1 text-xs font-medium text-gray-700">{rating}</span>
                  </div>
                  <span className="ml-2 text-xs text-gray-500">({product.reviews?.length || 0})</span>
                </div>
              ) : (
                <span className="text-xs text-gray-500">No reviews yet</span>
              )}
            </div>

            {/* Price display - REMOVED mt-auto TO FIX THE GAP */}
            <div className="mt-2">
              {isOnSale ? (
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900">
                    {currencySymbol}{displayPrice}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {currencySymbol}
                    {currency === "LKR" 
                      ? product.priceLKR?.toFixed(2) 
                      : product.priceUSD?.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  {currencySymbol}{displayPrice}
                </span>
              )}
            </div>

            {/* Combined quantity selector and add to cart button in the same row */}
            {product.stock > 0 && (
              <div className="mt-3 flex items-center space-x-2">
                {/* Enhanced quantity selector */}
                <div className="flex items-center bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg overflow-hidden shadow-sm border border-purple-100">
                  <button 
                    onClick={decrementQuantity}
                    className={`px-2 py-1 transition-all duration-150 ${
                      quantity <= 1 
                        ? "text-gray-300 cursor-not-allowed" 
                        : "text-purple-700 hover:bg-purple-100 active:bg-purple-200"
                    }`}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <div className="px-3 py-1 bg-white font-semibold text-gray-800 text-sm border-x border-purple-100 min-w-[2rem] text-center">
                    {quantity}
                  </div>
                  <button 
                    onClick={incrementQuantity}
                    className={`px-2 py-1 transition-all duration-150 ${
                      quantity >= product.stock 
                        ? "text-gray-300 cursor-not-allowed" 
                        : "text-purple-700 hover:bg-purple-100 active:bg-purple-200"
                    }`}
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                    </svg>
                  </button>
                </div>
                
                {/* Add to cart button - more polished */}
                <button 
                  className={`flex-1 transition-all duration-300 ${
                    isAddingToCart 
                      ? "bg-green-600 shadow-lg shadow-green-200" 
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg hover:shadow-purple-100"
                  } text-white text-sm font-medium py-1.5 px-3 rounded-lg flex items-center justify-center`}
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <motion.div 
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="flex items-center justify-center"
                    >
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Added
                    </motion.div>
                  ) : (
                    <>
                      <ShoppingBagIcon className="w-4 h-4 mr-1" />
                      {quantity > 1 ? `Add ${quantity}` : 'Add to Cart'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </Link>
    </div>
  );
}