"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import ProductCard from "../shared/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Product, ProductCategory } from "@prisma/client";

interface FeaturedProductsProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  categories: ProductCategory[];
  addToCart: (product: Product) => void;
  country: string;
}

export default function FeaturedProducts({
  products,
  loading,
  error,
  categories,
  addToCart,
  country,
}: FeaturedProductsProps) {
  const [activeTag, setActiveTag] = useState("all");
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [searchQuery, setSearchQuery] = useState("");
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Cosmetics"; // Default to "Cosmetics" if not found
  };

  // Define the filter tabs
  const filterTabs = [
    { id: "all", name: "All Products" },
    { id: "new-arrivals", name: "New Arrivals" },
    { id: "best-sellers", name: "Best Sellers" },
    { id: "special-deals", name: "Special Deals" },
    { id: "gift-sets", name: "Gift Sets" },
    { id: "trending", name: "Trending Now" },
  ];

  // Filter products based on active tag and search query
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      // Filter by search query
      if (
        searchQuery &&
        !product.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Filter by tag
      if (activeTag !== "all") {
        // Check if product has tags property and if it contains the active tag
        if (!product.tags) return false;

        // If tags is a string, convert to array first
        const productTags =
          typeof product.tags === "string"
            ? JSON.parse(product.tags as string)
            : product.tags;

        if (
          !Array.isArray(productTags) ||
          !productTags.includes(activeTag.replace(/-/g, " "))
        ) {
          return false;
        }
      }

      return true;
    });
  }, [products, activeTag, searchQuery]);

  // Load more products
  const handleLoadMore = () => {
    setVisibleProducts((prev) => Math.min(prev + 4, filteredProducts.length));
  };

  // Reset visible products count when tag changes
  useEffect(() => {
    setVisibleProducts(8);
  }, [activeTag, searchQuery]);

  // Container and item animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Animation variants for floating particles
  const floatingParticle = {
    animate: (custom: any) => ({
      y: [0, custom.y, 0],
      x: [0, custom.x, 0],
      opacity: [custom.opacityStart, custom.opacityEnd, custom.opacityStart],
      scale: custom.scale ? [1, custom.scale, 1] : [1, 1, 1],
      transition: {
        duration: custom.duration || 10,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <section
      className="py-16 bg-gradient-to-b from-purple-50 via-white to-purple-50 relative overflow-hidden px-12"
      ref={ref}
      id="featured-products"
    >
      {/* Animated Background Elements with Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large blurred gradient background */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-100/30 to-pink-100/30 blur-3xl"
          style={{ top: "5%", left: "50%", translateX: "-50%" }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 15,
            ease: "easeInOut",
          }}
        />

        {/* Floating particles with various sizes and positions */}
        <motion.div
          className="absolute w-10 h-10 rounded-full bg-purple-200/70"
          style={{ top: "15%", left: "10%" }}
          custom={{
            y: -30,
            x: 20,
            opacityStart: 0.6,
            opacityEnd: 0.8,
            duration: 8,
          }}
          variants={floatingParticle}
          animate="animate"
        />

        <motion.div
          className="absolute w-8 h-8 rounded-full bg-pink-200/70"
          style={{ top: "25%", right: "15%" }}
          custom={{
            y: 25,
            x: -15,
            opacityStart: 0.5,
            opacityEnd: 0.7,
            duration: 10,
          }}
          variants={floatingParticle}
          animate="animate"
        />

        <motion.div
          className="absolute w-16 h-16 rounded-full bg-purple-100/60"
          style={{ bottom: "20%", left: "20%" }}
          custom={{
            y: -20,
            x: 15,
            opacityStart: 0.4,
            opacityEnd: 0.6,
            duration: 12,
          }}
          variants={floatingParticle}
          animate="animate"
        />

        <motion.div
          className="absolute w-12 h-12 rounded-full bg-pink-100/60"
          style={{ bottom: "30%", right: "10%" }}
          custom={{
            y: 20,
            x: -10,
            opacityStart: 0.4,
            opacityEnd: 0.6,
            duration: 9,
          }}
          variants={floatingParticle}
          animate="animate"
        />

        <motion.div
          className="absolute w-14 h-14 rounded-full bg-gradient-to-r from-purple-200/50 to-pink-200/50 blur-sm"
          style={{ top: "45%", right: "30%" }}
          custom={{
            scale: 1.2,
            opacityStart: 0.3,
            opacityEnd: 0.5,
            duration: 14,
          }}
          variants={floatingParticle}
          animate="animate"
        />

        <motion.div
          className="absolute w-6 h-6 rounded-full bg-purple-300/60"
          style={{ top: "65%", left: "35%" }}
          custom={{
            y: 15,
            x: 10,
            opacityStart: 0.5,
            opacityEnd: 0.7,
            duration: 7,
          }}
          variants={floatingParticle}
          animate="animate"
        />

        <motion.div
          className="absolute w-5 h-5 rounded-full bg-pink-300/60"
          style={{ top: "35%", left: "15%" }}
          custom={{
            y: -12,
            x: -8,
            opacityStart: 0.4,
            opacityEnd: 0.6,
            duration: 6,
          }}
          variants={floatingParticle}
          animate="animate"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="inline-block bg-purple-100 text-purple-600 px-4 py-1 rounded-full text-sm font-medium mb-3">
            Curated For You
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Featured Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover thousands of high-quality products handpicked to meet your
            every need — from the latest trends to timeless everyday essentials.
          </p>
        </motion.div>

        {/* Combined Filter, Search, and Link Controls in One Line */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col md:flex-row items-center justify-between w-full mb-8 gap-4 py-2 px-4 rounded-lg"
        >
          {/* Tag filters */}
          <div className="flex overflow-x-auto hide-scrollbar py-1 md:py-0 min-w-0">
            <div className="flex space-x-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTag(tab.id)}
                  className={`whitespace-nowrap px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTag === tab.id
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                  aria-current={activeTag === tab.id ? "page" : undefined}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search and All Products Link side by side */}
          <div className="flex items-center gap-2 md:ml-auto shrink-0">
            {/* Search input */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Search products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              )}
            </div>

            {/* Link to all products */}
            <Link
              href="/products"
              className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors whitespace-nowrap px-3 py-2"
            >
              All Products
              <svg
                className="ml-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-sm p-3"
              >
                <div className="aspect-square bg-gray-200 rounded-md animate-pulse mb-3"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-full mt-3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center my-12">
            <svg
              className="w-12 h-12 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 className="text-lg font-medium mb-2">
              Could not load products
            </h3>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="mx-auto h-24 w-24 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-12 w-12"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No products found
            </h3>
            {searchQuery || activeTag !== "all" ? (
              <>
                <p className="text-gray-600 mb-6">
                  We couldn't find any products matching
                  {searchQuery ? ` "${searchQuery}"` : ""}
                  {activeTag !== "all"
                    ? ` in ${filterTabs.find((t) => t.id === activeTag)?.name}`
                    : ""}
                  .
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTag("all");
                  }}
                  className="text-purple-600 font-medium hover:text-purple-800"
                >
                  Clear search and filters
                </button>
              </>
            ) : (
              <p className="text-gray-600">
                We're currently updating our collection. Please check back soon!
              </p>
            )}
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <AnimatePresence>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            >
              {filteredProducts
                .slice(0, visibleProducts)
                .map((product, index) => (
                  <motion.div key={product.id} variants={itemVariants}>
                    <ProductCard
                      product={product}
                      categoryName={getCategoryName(product.categoryId)}
                      addToCart={(product) =>
                        Promise.resolve(addToCart(product))
                      }
                      country={country}
                    />
                  </motion.div>
                ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Load More Button */}
        {!loading && !error && filteredProducts.length > visibleProducts && (
          <div className="mt-10 text-center">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center px-6 py-3 border border-purple-300 rounded-md shadow-sm text-base font-medium text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              Load More Products
              <svg
                className="ml-2 -mr-0.5 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Empty space for better spacing at the bottom */}
        <div className="h-8"></div>
      </div>
    </section>
  );
}
