"use client";

import React, { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { ProductCategory } from "@prisma/client";
import axios from "axios";

interface FilterItem {
  label: string;
  value: string;
  param: string;
}

interface ProductsActiveFiltersProps {
  activeFilters: FilterItem[];
  onRemoveFilter: (param: string) => void;
  onClearAll: () => void;
}

export default function ProductsActiveFilters({
  activeFilters,
  onRemoveFilter,
  onClearAll,
}: ProductsActiveFiltersProps) {
  if (activeFilters.length === 0) return null;
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  console.log(activeFilters);

  useEffect(() => {
    // Fetch categories data
    axios
      .get("/api/categories")
      .then((res) => {
        setCategories(res.data.categories);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Cosmetics"; // Default to "Cosmetics" if not found
  };

  return (
    <div className="bg-purple-50 rounded-lg p-3 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-purple-700 text-sm font-medium mr-2">
          Active Filters:
        </span>

        {activeFilters.map((filter, index) => (
          <button
            key={index}
            onClick={() => onRemoveFilter(filter.param)}
            className="inline-flex items-center px-3 py-1 rounded-full bg-white 
                     text-purple-700 text-sm shadow-sm border border-purple-200 
                     hover:bg-purple-100 transition-colors"
          >
            <span className="text-gray-500 mr-1">{filter.label}:</span>
            {filter.param === "category"
              ? getCategoryName(filter.value)
              : filter.value}
            <XMarkIcon className="ml-1 h-4 w-4 text-gray-400" />
          </button>
        ))}

        <button
          onClick={onClearAll}
          className="inline-flex items-center px-3 py-1 rounded-full 
                   bg-purple-600 text-white text-sm shadow-sm 
                   hover:bg-purple-700 transition-colors ml-auto"
        >
          Clear All Filters
          <XMarkIcon className="ml-1 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
