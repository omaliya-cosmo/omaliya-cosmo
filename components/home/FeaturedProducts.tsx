"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import ProductCard from "../shared/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface Product {
  id: string;
  name: string;
  price: {
    usd: number;
    lkr: number;
  };
  image: string;
  categoryId: string;
  rating?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  discountPercentage?: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface FeaturedProductsProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  categories: Category[];
  addToCart: (product: Product) => void;
  country: string;
  viewMode?: "grid" | "list";
}

export default function FeaturedProducts({
  products,
  loading,
  error,
  categories,
  addToCart,
  country,
  viewMode = "grid",
}: FeaturedProductsProps) {
  const [activeCategory, setActiveCategory] = useState("all");
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

  // Get list of unique categories from products for the filter tabs
  const productCategories = useMemo(() => {
    if (!products || products.length === 0) return [];

    const uniqueCategories = Array.from(
      new Set(products.map((product) => product.categoryId))
    ).map((categoryId) => {
      const category = categories.find((cat) => cat.id === categoryId);
      return {
        id: categoryId,
        name: category ? category.name : "Unknown",
      };
    });

    return uniqueCategories;
  }, [products, categories]);

  // Filter products based on active category and search query
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

      // Filter by category
      if (activeCategory !== "all" && product.categoryId !== activeCategory) {
        return false;
      }

      return true;
    });
  }, [products, activeCategory, searchQuery]);

  // Load more products
  const handleLoadMore = () => {
    setVisibleProducts((prev) => Math.min(prev + 4, filteredProducts.length));
  };

  // Reset visible products count when category changes
  useEffect(() => {
    setVisibleProducts(8);
  }, [activeCategory, searchQuery]);

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

  return (
    <section className="py-16 bg-gradient-to-b from-purple-50 via-white to-purple-50" ref={ref} id="featured-products">
      <div className="container mx-auto px-4">
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
            Discover our handpicked selection of premium products, crafted with
            the finest ingredients for exceptional results.
          </p>
        </motion.div>

        {/* Filter and Search Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
        >
          {/* Category filters */}
          <div className="flex overflow-x-auto hide-scrollbar py-2 md:py-0 w-full md:w-auto">
            <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm">
              <button
                onClick={() => setActiveCategory("all")}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeCategory === "all"
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
                aria-current={activeCategory === "all" ? "page" : undefined}
              >
                All Products
              </button>

              {productCategories.slice(0, 4).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeCategory === category.id
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                  aria-current={
                    activeCategory === category.id ? "page" : undefined
                  }
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search input */}
          <div className="relative w-full md:w-auto">
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
              className="block w-full md:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
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
            {searchQuery ? (
              <>
                <p className="text-gray-600 mb-6">
                  We couldn't find any products matching "{searchQuery}"
                  {activeCategory !== "all" ? ` in this category` : ""}.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
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
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                  : "space-y-4"
              }
              variants={containerVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            >
              {filteredProducts
                .slice(0, visibleProducts)
                .map((product, index) => (
                  <motion.div key={product.id} variants={itemVariants}>
                    {viewMode === "grid" ? (
                      <ProductCard
                        product={product}
                        categoryName={getCategoryName(product.categoryId)}
                        addToCart={(product) =>
                          Promise.resolve(addToCart(product))
                        }
                        country={country}
                      />
                    ) : (
                      <ProductCard
                        product={product}
                        categoryName={getCategoryName(product.categoryId)}
                        addToCart={(product) =>
                          Promise.resolve(addToCart(product))
                        }
                        country={country}
                      />
                    )}
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

        {/* View All Link - visible when there are more products than what's displayed */}
        {!loading && !error && filteredProducts.length > 8 && (
          <div className="mt-10 text-center">
            <Link
              href="/products"
              className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors"
            >
              View All Products
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
        )}

        {/* Empty space for better spacing at the bottom */}
        <div className="h-8"></div>
      </div>
    </section>
  );
}
