"use client";
import React, { useState, useEffect } from "react";
import ProductsHeader from "@/components/products/ProductsHeader";
import ProductFilterSidebar from "@/components/products/ProductFilterSidebar";
import ProductGrid from "@/components/products/ProductGrid";
import ClientSortingWrapper from "@/components/products/ClientSortingWrapper";
import ClientEmptyStateWrapper from "@/components/products/ClientEmptyStateWrapper";
import ProductsPagination from "@/components/products/ProductsPagination";
import CategoryTabsFilter from "@/components/products/CategoryTabsFilter";
import ProductsSorting from "@/components/products/ProductsSorting";

import {
  ProductCategory,
  Review,
  Product as PrismaProduct,
} from "@prisma/client";
import { motion } from "framer-motion";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { useCart } from "../lib/hooks/CartContext";
import { useCountry } from "../lib/hooks/useCountry";

// Define ProductTag enum
enum ProductTag {
  NEW_ARRIVALS = "NEW_ARRIVALS",
  BEST_SELLERS = "BEST_SELLERS",
  SPECIAL_DEALS = "SPECIAL_DEALS",
  GIFT_SETS = "GIFT_SETS",
  TRENDING_NOW = "TRENDING_NOW",
}

interface Product extends PrismaProduct {
  category: ProductCategory; // Include the category relation
  reviews: Review[]; // Include reviews with count and average rating
  tags: ProductTag[]; // Add tags property
}

interface CartProduct {
  id: string;
  name: string;
}

// Update the filters state interface
interface Filters {
  category: string;
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  rating?: number;
  search: string;
  tags?: string[];
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState("default"); // Change initial value to 'default'
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); // Add viewMode state
  const [filters, setFilters] = useState<Filters>({
    category: searchParams.get("category") || "",
    minPrice: undefined,
    maxPrice: undefined,
    inStock: false,
    rating: undefined,
    search: "",
    tags: searchParams.get("feature") ? [searchParams.get("feature")!] : [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { country, updateCountry } = useCountry();
  const pageSize = 12;

  // New state variables for header props

  const { refreshCart } = useCart();

  // Handle category change from tabs
  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      category,
    }));
    setCurrentPage(1);
  };

  useEffect(() => {
    // Fetch all products from the API
    async function fetchProducts() {
      try {
        setLoading(true);

        // Fetch products
        const productsResponse = await axios.get(
          "/api/products?category=true&reviews=true"
        );
        setProducts(productsResponse.data.products);
        setFilteredProducts(productsResponse.data.products); // Initialize with all products

        setLoading(false);
      } catch (err: string | any) {
        setError(err);
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter((product) => {
        console.log(
          "filter",
          product.category?.name.toLowerCase(),
          filters.category
        );
        return product.category?.name.toLowerCase() === filters.category;
      });
    }

    if (filters.minPrice !== undefined && filters.minPrice !== null) {
      filtered = filtered.filter((product) =>
        country === "LK"
          ? product.priceLKR >= filters.minPrice!
          : product.priceUSD >= filters.minPrice!
      );
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      filtered = filtered.filter((product) =>
        country === "LK"
          ? product.priceLKR <= filters.maxPrice!
          : product.priceUSD <= filters.maxPrice!
      );
    }

    if (filters.inStock) {
      filtered = filtered.filter((product) => product.stock > 0);
    }

    if (filters.rating) {
      filtered = filtered.filter((product) => {
        const avgRating =
          (product.reviews?.reduce((sum, review) => sum + review.rating, 0) ||
            0) / (product.reviews?.length || 1);
        return avgRating >= filters.rating!;
      });
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((product) =>
        filters.tags!.some((tag) =>
          product.tags.includes(tag as unknown as ProductTag)
        )
      );
    }

    // Update sorting logic to match the sort values
    switch (sort) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "price-low":
        filtered.sort(
          (a, b) =>
            (country === "LK" ? a.priceLKR : a.priceUSD) -
            (country === "LK" ? b.priceLKR : b.priceUSD)
        );
        break;
      case "price-high":
        filtered.sort(
          (a, b) =>
            (country === "LK" ? b.priceLKR : b.priceUSD) -
            (country === "LK" ? a.priceLKR : a.priceUSD)
        );
        break;
      case "rating":
        filtered.sort((a, b) => {
          const ratingA =
            (a.reviews ?? []).reduce((sum, review) => sum + review.rating, 0) /
              (a.reviews?.length || 1) || 0;
          const ratingB =
            (b.reviews ?? []).reduce((sum, review) => sum + review.rating, 0) /
              (b.reviews?.length || 1) || 0;
          return ratingB - ratingA;
        });
        break;
      default:
        // Keep original order for 'default' sorting
        break;
    }

    setFilteredProducts(filtered);
  }, [filters, sort, products, country]);

  useEffect(() => {
    // Update filters when search params change
    const category = searchParams.get("category") || "";
    const feature = searchParams.get("feature");

    setFilters((prev) => ({
      ...prev,
      category,
      tags: feature ? [feature] : prev.tags,
    }));
  }, [searchParams]);

  useEffect(() => {
    // Update URL when filters change
    const queryParams = new URLSearchParams();

    if (filters.category) {
      queryParams.set("category", filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      queryParams.set("feature", filters.tags[0]);
    }

    router.push(`${pathname}?${queryParams.toString()}`);
  }, [filters, router, pathname]);

  // Handle pagination
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  // Update the filter handling function
  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const addToCart = async (product: CartProduct) => {
    try {
      await axios.post("/api/cart", {
        productId: product.id,
        quantity: 1,
      });

      await refreshCart(); // Refresh cart data after adding product

      toast.success(`Added ${product.name} to your cart!`, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error adding to cart";
      toast.error(errorMessage, {
        position: "bottom-right",
      });
    }
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

  // Fade in animation for content sections
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <main className="bg-gradient-to-b from-purple-50 via-white to-purple-50 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large blurred background gradients */}
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-r from-purple-100/30 to-pink-100/30 blur-3xl"
          style={{ top: "5%", left: "30%", transform: "translateX(-50%)" }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-pink-100/20 to-purple-100/20 blur-3xl"
          style={{ bottom: "10%", right: "5%" }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            repeat: Infinity,
            duration: 25,
            ease: "easeInOut",
          }}
        />

        {/* Floating particles with various sizes and positions */}
        <motion.div
          className="absolute w-16 h-16 rounded-full bg-purple-200/60"
          style={{ top: "15%", left: "10%" }}
          custom={{
            y: -30,
            x: 20,
            opacityStart: 0.5,
            opacityEnd: 0.7,
            duration: 12,
          }}
          variants={floatingParticle}
          animate="animate"
        />

        <motion.div
          className="absolute w-12 h-12 rounded-full bg-pink-200/60"
          style={{ top: "25%", right: "15%" }}
          custom={{
            y: 25,
            x: -15,
            opacityStart: 0.4,
            opacityEnd: 0.6,
            duration: 14,
          }}
          variants={floatingParticle}
          animate="animate"
        />

        <motion.div
          className="absolute w-20 h-20 rounded-full bg-purple-100/50"
          style={{ bottom: "20%", left: "25%" }}
          custom={{
            y: -20,
            x: 15,
            opacityStart: 0.3,
            opacityEnd: 0.5,
            duration: 16,
          }}
          variants={floatingParticle}
          animate="animate"
        />

        <motion.div
          className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-purple-200/40 to-pink-200/40 blur-sm"
          style={{ bottom: "35%", right: "10%" }}
          custom={{
            y: 20,
            x: -10,
            opacityStart: 0.3,
            opacityEnd: 0.5,
            duration: 11,
          }}
          variants={floatingParticle}
          animate="animate"
        />

        <motion.div
          className="absolute w-8 h-8 rounded-full bg-purple-300/50"
          style={{ top: "55%", left: "8%" }}
          custom={{
            y: 15,
            x: 8,
            opacityStart: 0.4,
            opacityEnd: 0.6,
            duration: 9,
          }}
          variants={floatingParticle}
          animate="animate"
        />

        <motion.div
          className="absolute w-10 h-10 rounded-full bg-pink-300/50"
          style={{ top: "40%", right: "20%" }}
          custom={{
            y: -12,
            x: -6,
            opacityStart: 0.4,
            opacityEnd: 0.6,
            duration: 10,
          }}
          variants={floatingParticle}
          animate="animate"
        />
      </div>

      <div className="relative z-10">
        <div className="bg-gradient-to-r from-purple-150 to-pink-50 shadow-lg px-10">
          {/* Products header with enhanced styling */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ProductsHeader
              title="All Products"
              description="Discover our complete range of natural and organic beauty products."
              breadcrumbItems={[
                { label: "Home", href: "/" },
                { label: "Products", href: "/products", active: true },
              ]}
            />
          </motion.div>
        </div>

        <motion.div
          className="container mx-auto px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Category Tabs and Search Bar - Flexbox layout */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="w-full md:w-auto">
              <CategoryTabsFilter
                currentCategory={filters.category}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            <motion.div
              className="w-full md:w-80 lg:w-96 mx-auto md:mx-0 md:ml-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-purple-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-purple-100 hover:border-purple-200 focus:border-purple-300 rounded-xl shadow-sm transition-colors outline-none focus:ring-2 focus:ring-purple-200 placeholder-gray-400"
                  value={filters.search}
                  onChange={(e) =>
                    handleFilterChange({ search: e.target.value })
                  }
                />
                {filters.search && (
                  <button
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => handleFilterChange({ search: "" })}
                    aria-label="Clear search"
                  >
                    <svg
                      className="w-4 h-4 text-gray-400 hover:text-purple-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 px-4 md:px-8">
            {/* Filter sidebar with subtle animations */}
            <motion.aside
              className="lg:w-1/4"
              {...fadeIn}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-purple-100/50 p-4">
                <ProductFilterSidebar
                  currentFilters={filters}
                  onFilterChange={handleFilterChange}
                  productCount={filteredProducts.length}
                  country={country}
                />
              </div>
            </motion.aside>

            {/* Main product content with animations */}
            <motion.div
              className="lg:w-3/4"
              {...fadeIn}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {/* Sorting and product count */}
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-purple-100/50 relative z-20">
                <p className="text-gray-700">
                  {filteredProducts.length > 0 ? (
                    <>
                      Showing{" "}
                      <span className="font-medium text-purple-700">
                        {(currentPage - 1) * pageSize + 1}
                      </span>{" "}
                      -{" "}
                      <span className="font-medium text-purple-700">
                        {Math.min(
                          currentPage * pageSize,
                          filteredProducts.length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-purple-700">
                        {filteredProducts.length}
                      </span>{" "}
                      products
                    </>
                  ) : (
                    <span className="font-medium">No products found</span>
                  )}
                </p>

                <div className="z-30 relative">
                  <ProductsSorting
                    currentSort={sort}
                    viewMode={viewMode}
                    onSortChange={setSort}
                    onViewModeChange={setViewMode}
                  />
                </div>
              </div>

              {/* Products grid or empty state */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {paginatedProducts.length > 0 ? (
                  <div className="">
                    <ProductGrid
                      products={paginatedProducts}
                      country={country}
                      viewMode={viewMode}
                      onAddToCart={(productId) => {
                        const product = products.find(
                          (p) => p.id === productId
                        );
                        if (product) {
                          addToCart({ id: product.id, name: product.name });
                        }
                      }}
                    />
                  </div>
                ) : (
                  <ClientEmptyStateWrapper
                    message="No products found"
                    suggestion="Try adjusting your filters or search terms to find what you're looking for."
                    hasFilters={
                      filters.category !== null ||
                      (filters.tags?.length ?? 0) > 0
                    }
                  />
                )}
              </motion.div>

              {/* Pagination with animation */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="mt-8"
                >
                  <ProductsPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page: number) => setCurrentPage(page)}
                  />
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
