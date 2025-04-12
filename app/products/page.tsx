"use client";
import React, { useState, useEffect } from "react";
import ProductsHeader from "@/components/products/ProductsHeader";
import ProductFilterSidebar from "@/components/products/ProductFilterSidebar";
import ProductGrid from "@/components/products/ProductGrid";
import ProductsActiveFilters from "@/components/products/ProductsActiveFilters";
import NewsletterSection from "@/components/home/Newsletter";
import ClientSortingWrapper from "@/components/products/ClientSortingWrapper";
import ClientPaginationWrapper from "@/components/products/ClientPaginationWrapper";
import ClientEmptyStateWrapper from "@/components/products/ClientEmptyStateWrapper";
import {
  ProductCategory,
  Review,
  Product as PrismaProduct,
} from "@prisma/client";
import Header from "@/components/layout/Header";
import { motion } from "framer-motion";

interface Product extends PrismaProduct {
  category?: ProductCategory; // Include the category relation
  reviews?: Review[]; // Include reviews with count and average rating
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

// Add this to track active filters
interface ActiveFilter {
  label: string;
  value: string;
  param: string;
}

interface ClientPaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  currentParams: any;
  onPageChange: (page: number) => void;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState("default"); // Change initial value to 'default'
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); // Add viewMode state
  const [filters, setFilters] = useState<Filters>({
    category: "",
    minPrice: undefined,
    maxPrice: undefined,
    inStock: false,
    rating: undefined,
    search: "",
    tags: [],
  });

  const [country, setCountry] = useState("LKR"); // Default country currency
  const pageSize = 12;

  useEffect(() => {
    // Fetch all products from the API
    async function fetchProducts() {
      try {
        const axios = (await import("axios")).default;
        const response = await axios.get("/api/products");
        setProducts(response.data.products);
        setFilteredProducts(response.data.products); // Initialize with all products
        console.log(response.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }

    console.log(filteredProducts);

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(
        (product) => product.category?.id === filters.category
      );
    }

    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((product) =>
        country === "LKR"
          ? product.priceLKR >= filters.minPrice!
          : product.priceUSD >= filters.minPrice!
      );
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((product) =>
        country === "LKR"
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
        filters.tags!.some((tag) => product.tags.includes(tag))
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
            (country === "LKR" ? a.priceLKR : a.priceUSD) -
            (country === "LKR" ? b.priceLKR : b.priceUSD)
        );
        break;
      case "price-high":
        filtered.sort(
          (a, b) =>
            (country === "LKR" ? b.priceLKR : b.priceUSD) -
            (country === "LKR" ? a.priceLKR : a.priceUSD)
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

  // Add this useEffect to update active filters when filters change
  useEffect(() => {
    const newActiveFilters: ActiveFilter[] = [];

    if (filters.category) {
      newActiveFilters.push({
        label: "Category",
        value: filters.category,
        param: "category",
      });
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      newActiveFilters.push({
        label: "Price",
        value: `${filters.minPrice || 0} - ${filters.maxPrice || "∞"}`,
        param: "price",
      });
    }

    if (filters.rating) {
      newActiveFilters.push({
        label: "Rating",
        value: `${filters.rating}+ stars`,
        param: "rating",
      });
    }

    if (filters.inStock) {
      newActiveFilters.push({
        label: "Availability",
        value: "In Stock",
        param: "inStock",
      });
    }

    setActiveFilters(newActiveFilters);
  }, [filters]);

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

  const handleRemoveFilter = (param: string) => {
    setFilters((prev) => ({
      ...prev,
      [param]: param === "inStock" ? false : undefined,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: "",
      minPrice: undefined,
      maxPrice: undefined,
      inStock: false,
      rating: undefined,
      search: "",
      tags: [],
    });
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
      }
    })
  };

  // Fade in animation for content sections
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  // Animation for the active filter badges
  const filterBadgeAnimation = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0, transition: { duration: 0.2 } },
    transition: { type: "spring", stiffness: 500, damping: 30 }
  };

  return (
    <main className="bg-gradient-to-b from-purple-50 via-white to-purple-50 min-h-screen relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large blurred background gradients */}
        <motion.div 
          className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-r from-purple-100/30 to-pink-100/30 blur-3xl"
          style={{ top: '5%', left: '30%', transform: 'translateX(-50%)' }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 20,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-pink-100/20 to-purple-100/20 blur-3xl"
          style={{ bottom: '10%', right: '5%' }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 25,
            ease: "easeInOut"
          }}
        />
        
        {/* Floating particles with various sizes and positions */}
        <motion.div
          className="absolute w-16 h-16 rounded-full bg-purple-200/60"
          style={{ top: '15%', left: '10%' }}
          custom={{ y: -30, x: 20, opacityStart: 0.5, opacityEnd: 0.7, duration: 12 }}
          variants={floatingParticle}
          animate="animate"
        />
        
        <motion.div
          className="absolute w-12 h-12 rounded-full bg-pink-200/60"
          style={{ top: '25%', right: '15%' }}
          custom={{ y: 25, x: -15, opacityStart: 0.4, opacityEnd: 0.6, duration: 14 }}
          variants={floatingParticle}
          animate="animate"
        />
        
        <motion.div
          className="absolute w-20 h-20 rounded-full bg-purple-100/50"
          style={{ bottom: '20%', left: '25%' }}
          custom={{ y: -20, x: 15, opacityStart: 0.3, opacityEnd: 0.5, duration: 16 }}
          variants={floatingParticle}
          animate="animate"
        />
        
        <motion.div
          className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-purple-200/40 to-pink-200/40 blur-sm"
          style={{ bottom: '35%', right: '10%' }}
          custom={{ y: 20, x: -10, opacityStart: 0.3, opacityEnd: 0.5, duration: 11 }}
          variants={floatingParticle}
          animate="animate"
        />
        
        <motion.div
          className="absolute w-8 h-8 rounded-full bg-purple-300/50"
          style={{ top: '55%', left: '8%' }}
          custom={{ y: 15, x: 8, opacityStart: 0.4, opacityEnd: 0.6, duration: 9 }}
          variants={floatingParticle}
          animate="animate"
        />
        
        <motion.div
          className="absolute w-10 h-10 rounded-full bg-pink-300/50"
          style={{ top: '40%', right: '20%' }}
          custom={{ y: -12, x: -6, opacityStart: 0.4, opacityEnd: 0.6, duration: 10 }}
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
          {/* Active filters with animation */}
          {activeFilters.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ProductsActiveFilters
                activeFilters={activeFilters}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={clearAllFilters}
                animationProps={filterBadgeAnimation}
              />
            </motion.div>
          )}

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
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-purple-100/50">
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

                <ClientSortingWrapper
                  currentSort={sort}
                  viewMode={viewMode}
                  onSortChange={setSort}
                  onViewModeChange={setViewMode}
                />
              </div>

              {/* Products grid or empty state */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {paginatedProducts.length > 0 ? (
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-purple-100/50">
                    <ProductGrid
                      products={paginatedProducts}
                      currency={country === "LKR" ? "LKR" : "USD"}
                      currencySymbol={country === "LKR" ? "Rs" : "$"}
                      viewMode={viewMode}
                    />
                  </div>
                ) : (
                  <ClientEmptyStateWrapper
                    message="No products found"
                    suggestion="Try adjusting your filters or search terms to find what you're looking for."
                    hasFilters={activeFilters.length > 0}
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
                  <ClientPaginationWrapper
                    currentPage={currentPage}
                    totalPages={totalPages}
                    currentParams={{}}
                    onPageChange={(page: number) => setCurrentPage(page)}
                  />
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Newsletter section */}
      <NewsletterSection />
    </main>
  );
}
