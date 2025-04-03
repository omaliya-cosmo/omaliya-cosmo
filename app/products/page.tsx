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

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Products header */}
      <ProductsHeader
        title="All Products"
        description="Discover our complete range of natural and organic beauty products."
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products", active: true },
        ]}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Active filters */}
        {activeFilters.length > 0 && (
          <ProductsActiveFilters
            activeFilters={activeFilters}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={clearAllFilters}
          />
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter sidebar */}
          <aside className="lg:w-1/4">
            <ProductFilterSidebar
              currentFilters={filters}
              onFilterChange={handleFilterChange}
              productCount={filteredProducts.length}
            />
          </aside>

          {/* Main product content */}
          <div className="lg:w-3/4">
            {/* Sorting and product count */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-gray-600">
                {filteredProducts.length > 0 ? (
                  <>
                    Showing{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-medium">
                      {Math.min(
                        currentPage * pageSize,
                        filteredProducts.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
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
            {paginatedProducts.length > 0 ? (
              <ProductGrid
                products={paginatedProducts}
                currency={country === "LKR" ? "LKR" : "USD"}
                currencySymbol={country === "LKR" ? "Rs" : "$"}
                viewMode={viewMode} // Add this prop
              />
            ) : (
              <ClientEmptyStateWrapper
                message="No products found"
                suggestion="Try adjusting your filters or search terms to find what you're looking for."
                hasFilters={activeFilters.length > 0}
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <ClientPaginationWrapper
                currentPage={currentPage}
                totalPages={totalPages}
                currentParams={{}} // Empty object since it's required by the interface but not used
                onPageChange={(page: number) => setCurrentPage(page)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Newsletter section */}
      <NewsletterSection />
    </main>
  );
}
