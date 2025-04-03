"use client";

import React, { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";
import { ProductCategory } from "@prisma/client";
import axios from "axios";
import { useCountry } from "@/app/lib/hooks/useCountry";

interface FilterSidebarProps {
  currentFilters: {
    category: string;
    minPrice?: number;
    maxPrice?: number;
    inStock: boolean;
    rating?: number;
    search: string;
  };
  onFilterChange: (filters: any) => void;
  productCount: number;
}

const priceRangesUSD = [
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25 to $50", min: 25, max: 50 },
  { label: "$50 to $100", min: 50, max: 100 },
  { label: "$100 to $200", min: 100, max: 200 },
  { label: "Over $200", min: 200, max: Infinity },
];

const priceRangesLKR = [
  { label: "Under LKR 1000", min: 0, max: 1000 },
  { label: "LKR 1000 to LKR 2500", min: 1000, max: 2500 },
  { label: "LKR 2500 to LKR 5000", min: 2500, max: 5000 },
  { label: "LKR 5000 to LKR 10000", min: 5000, max: 10000 },
  { label: "Over LKR 10000", min: 10000, max: Infinity },
];

export default function ProductFilterSidebar({
  currentFilters,
  onFilterChange,
  productCount,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    rating: true,
    availability: true,
  });
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const { country, updateCountry } = useCountry();

  useEffect(() => {
    axios
      .get("/api/categories")
      .then((res) => {
        setCategories(res.data.categories);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []); // Re-fetch when sort changes

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 sticky top-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
      </div>

      {/* Categories Section */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <button
          className="flex justify-between items-center w-full text-left"
          onClick={() => toggleSection("category")}
        >
          <h3 className="text-sm font-medium text-gray-900">Categories</h3>
          <span className="text-purple-600">
            {expandedSections.category ? "-" : "+"}
          </span>
        </button>

        <AnimatePresence>
          {expandedSections.category && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 space-y-2"
            >
              {categories.map((category) => (
                <div key={category.id} className="flex items-center">
                  <input
                    id={`category-${category.id}`}
                    type="radio"
                    checked={currentFilters.category === category.id}
                    onChange={() =>
                      onFilterChange({
                        ...currentFilters,
                        category: category.id,
                      })
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="ml-3 text-sm text-gray-600"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Range Section */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <button
          className="flex justify-between items-center w-full text-left"
          onClick={() => toggleSection("price")}
        >
          <h3 className="text-sm font-medium text-gray-900">Price Range</h3>
          <span className="text-purple-600">
            {expandedSections.price ? "-" : "+"}
          </span>
        </button>

        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 space-y-2"
            >
              {(country === "LK" ? priceRangesLKR : priceRangesUSD).map(
                (range, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      id={`price-${index}`}
                      type="radio"
                      checked={
                        currentFilters.minPrice === range.min &&
                        currentFilters.maxPrice === range.max
                      }
                      onChange={() =>
                        onFilterChange({
                          ...currentFilters,
                          minPrice: range.min,
                          maxPrice: range.max,
                        })
                      }
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                    />
                    <label
                      htmlFor={`price-${index}`}
                      className="ml-3 text-sm text-gray-600"
                    >
                      {range.label}
                    </label>
                  </div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Availability Section */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <button
          className="flex justify-between items-center w-full text-left"
          onClick={() => toggleSection("availability")}
        >
          <h3 className="text-sm font-medium text-gray-900">Availability</h3>
          <span className="text-purple-600">
            {expandedSections.availability ? "-" : "+"}
          </span>
        </button>

        <AnimatePresence>
          {expandedSections.availability && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4"
            >
              <div className="flex items-center">
                <input
                  id="in-stock"
                  type="checkbox"
                  checked={currentFilters.inStock}
                  onChange={(e) =>
                    onFilterChange({
                      ...currentFilters,
                      inStock: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                />
                <label
                  htmlFor="in-stock"
                  className="ml-3 text-sm text-gray-600"
                >
                  In Stock Only
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product count */}
      <div className="pt-2 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Showing {productCount} {productCount === 1 ? "product" : "products"}
        </p>
      </div>
    </div>
  );
}
