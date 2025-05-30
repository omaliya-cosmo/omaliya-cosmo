"use client";

import React, { useEffect, useState } from "react";
import { XMarkIcon, FunnelIcon, StarIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";
import { useCountry } from "@/app/lib/hooks/useCountry";

enum ProductTag {
  NEW_ARRIVALS = "NEW_ARRIVALS",
  BEST_SELLERS = "BEST_SELLERS",
  SPECIAL_DEALS = "SPECIAL_DEALS",
  GIFT_SETS = "GIFT_SETS",
  TRENDING_NOW = "TRENDING_NOW",
}

interface FilterSidebarProps {
  currentFilters: {
    category: string;
    minPrice?: number | null;
    maxPrice?: number | null;
    inStock: boolean;
    rating?: number;
    search: string;
    tags?: string[];
  };
  onFilterChange: (filters: any) => void;
  productCount: number;
  country: string;
}

const priceRangesUSD = [
  { label: "Any Price", min: undefined, max: undefined },
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25 to $50", min: 25, max: 50 },
  { label: "$50 to $100", min: 50, max: 100 },
  { label: "$100 to $200", min: 100, max: 200 },
  { label: "Over $200", min: 200, max: Infinity },
];

const priceRangesLKR = [
  { label: "Any Price", min: undefined, max: undefined },
  { label: "Under LKR 1000", min: 0, max: 1000 },
  { label: "LKR 1000 to LKR 2500", min: 1000, max: 2500 },
  { label: "LKR 2500 to LKR 5000", min: 2500, max: 5000 },
  { label: "LKR 5000 to LKR 10000", min: 5000, max: 10000 },
  { label: "Over LKR 10000", min: 10000, max: Infinity },
];

// Define tag display names
const tagDisplayNames: Record<string, string> = {
  [ProductTag.NEW_ARRIVALS]: "New Arrivals",
  [ProductTag.BEST_SELLERS]: "Best Sellers",
  [ProductTag.SPECIAL_DEALS]: "Special Deals",
  [ProductTag.GIFT_SETS]: "Gift Sets",
  [ProductTag.TRENDING_NOW]: "Trending Now",
};

export default function ProductFilterSidebar({
  currentFilters,
  onFilterChange,
  productCount,
  country,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    rating: true,
    availability: true,
    tags: true,
  });

  // Check if any filters are active
  const hasActiveFilters =
    currentFilters.category ||
    currentFilters.minPrice !== undefined ||
    currentFilters.maxPrice !== undefined ||
    currentFilters.inStock ||
    currentFilters.rating !== undefined ||
    (currentFilters.tags && currentFilters.tags.length > 0);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const clearAllFilters = () => {
    onFilterChange({
      ...currentFilters,
      category: "",
      minPrice: null,
      maxPrice: null,
      inStock: false,
      rating: undefined,
      tags: [],
    });
  };

  const clearPriceRange = () => {
    // Use null instead of undefined for more explicit clearing
    onFilterChange({
      ...currentFilters,
      minPrice: null,
      maxPrice: null,
    });

    // Force a check on the "Any Price" option (first in the list)
    const anyPriceRadio = document.getElementById(
      "price-0"
    ) as HTMLInputElement;
    if (anyPriceRadio) {
      anyPriceRadio.checked = true;
    }
  };

  const clearRating = () => {
    onFilterChange({
      ...currentFilters,
      rating: undefined,
    });
  };

  const clearTags = () => {
    onFilterChange({
      ...currentFilters,
      tags: [],
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 sticky top-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-purple-600" />
          Filters
        </h2>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center"
          >
            Clear All
            <XMarkIcon className="ml-1 h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tags Section */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <div className="flex justify-between items-center">
          <button
            className="flex items-center text-left grow"
            onClick={() => toggleSection("tags")}
          >
            <h3 className="text-sm font-medium text-gray-900">
              Product Features
            </h3>
            <span className="text-purple-600 ml-2">
              {expandedSections.tags ? "-" : "+"}
            </span>
          </button>

          {currentFilters.tags && currentFilters.tags.length > 0 && (
            <button
              onClick={clearTags}
              className="text-xs text-gray-500 hover:text-purple-600"
            >
              Clear
            </button>
          )}
        </div>

        <AnimatePresence>
          {expandedSections.tags && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 space-y-2 overflow-hidden"
            >
              {Object.values(ProductTag).map((tag) => (
                <div key={tag} className="flex items-center">
                  <input
                    id={`tag-${tag}`}
                    type="checkbox"
                    checked={currentFilters.tags?.includes(tag) || false}
                    onChange={(e) => {
                      let newTags = [...(currentFilters.tags || [])];
                      if (e.target.checked) {
                        newTags.push(tag);
                      } else {
                        newTags = newTags.filter((t) => t !== tag);
                      }
                      onFilterChange({
                        ...currentFilters,
                        tags: newTags,
                      });
                    }}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <label
                    htmlFor={`tag-${tag}`}
                    className="ml-3 text-sm text-gray-600"
                  >
                    {tagDisplayNames[tag]}
                  </label>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Range Section */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <div className="flex justify-between items-center">
          <button
            className="flex items-center text-left grow"
            onClick={() => toggleSection("price")}
          >
            <h3 className="text-sm font-medium text-gray-900">Price Range</h3>
            <span className="text-purple-600 ml-2">
              {expandedSections.price ? "-" : "+"}
            </span>
          </button>

          {((currentFilters.minPrice !== undefined &&
            currentFilters.minPrice !== null) ||
            (currentFilters.maxPrice !== undefined &&
              currentFilters.maxPrice !== null)) && (
            <button
              onClick={clearPriceRange}
              className="text-xs text-gray-500 hover:text-purple-600"
            >
              Clear
            </button>
          )}
        </div>

        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 space-y-2 overflow-hidden"
            >
              {(country === "LK" ? priceRangesLKR : priceRangesUSD).map(
                (range, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      id={`price-${index}`}
                      type="radio"
                      checked={
                        (index === 0 &&
                          (currentFilters.minPrice === undefined ||
                            currentFilters.minPrice === null) &&
                          (currentFilters.maxPrice === undefined ||
                            currentFilters.maxPrice === null)) ||
                        (currentFilters.minPrice === range.min &&
                          currentFilters.maxPrice === range.max)
                      }
                      onChange={() =>
                        onFilterChange({
                          ...currentFilters,
                          minPrice: range.min,
                          maxPrice: range.max,
                        })
                      }
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label
                      htmlFor={`price-${index}`}
                      className="ml-2 text-sm text-gray-700"
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

      {/* Rating Section */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <div className="flex justify-between items-center">
          <button
            className="flex items-center text-left grow"
            onClick={() => toggleSection("rating")}
          >
            <h3 className="text-sm font-medium text-gray-900">Rating</h3>
            <span className="text-purple-600 ml-2">
              {expandedSections.rating ? "-" : "+"}
            </span>
          </button>

          {currentFilters.rating !== undefined && (
            <button
              onClick={clearRating}
              className="text-xs text-gray-500 hover:text-purple-600"
            >
              Clear
            </button>
          )}
        </div>

        <AnimatePresence>
          {expandedSections.rating && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 space-y-2 overflow-hidden"
            >
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center">
                  <input
                    id={`rating-${stars}`}
                    type="radio"
                    checked={currentFilters.rating === stars}
                    onChange={() =>
                      onFilterChange({
                        ...currentFilters,
                        rating: stars,
                      })
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <label
                    htmlFor={`rating-${stars}`}
                    className="ml-3 text-sm text-gray-600 flex items-center"
                  >
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-4 h-4 ${
                          i < stars ? "text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-1">&amp; Up</span>
                  </label>
                </div>
              ))}
              <div className="flex items-center">
                <input
                  id="rating-any"
                  type="radio"
                  checked={currentFilters.rating === undefined}
                  onChange={() =>
                    onFilterChange({
                      ...currentFilters,
                      rating: undefined,
                    })
                  }
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                />
                <label
                  htmlFor="rating-any"
                  className="ml-3 text-sm text-gray-600"
                >
                  Any Rating
                </label>
              </div>
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
              transition={{ duration: 0.2 }}
              className="mt-4 overflow-hidden"
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
          Showing <span className="font-medium">{productCount}</span>{" "}
          {productCount === 1 ? "product" : "products"}
        </p>
      </div>
    </div>
  );
}
