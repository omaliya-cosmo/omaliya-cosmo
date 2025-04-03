'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface FilterItem {
  label: string;
  value: string;
  param: string;
}

interface ProductsActiveFiltersProps {
  activeFilters: FilterItem[];
  currentParams: any;
}

export default function ProductsActiveFilters({ activeFilters, currentParams }: ProductsActiveFiltersProps) {
  const router = useRouter();
  
  const removeFilter = (param: string) => {
    const params = new URLSearchParams();
    
    // Copy current params excluding the one to remove
    Object.entries(currentParams).forEach(([key, value]) => {
      if (key !== param) {
        params.append(key, value as string);
      }
    });
    
    router.push(`/products?${params.toString()}`);
  };
  
  const clearAllFilters = () => {
    // Keep only the sort and page params if present
    const params = new URLSearchParams();
    if (currentParams.sort) params.append('sort', currentParams.sort);
    if (currentParams.page) params.append('page', currentParams.page);
    
    router.push(`/products?${params.toString()}`);
  };
  
  return (
    <div className="bg-purple-50 rounded-lg p-3 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-purple-700 text-sm font-medium mr-2">Active Filters:</span>
        
        {activeFilters.map((filter, index) => (
          <button
            key={index}
            onClick={() => removeFilter(filter.param)}
            className="inline-flex items-center px-3 py-1 rounded-full bg-white text-purple-700 text-sm shadow-sm border border-purple-200 hover:bg-purple-100 transition-colors"
          >
            <span className="text-gray-500 mr-1">{filter.label}:</span> {filter.value}
            <XMarkIcon className="ml-1 h-4 w-4 text-gray-400" />
          </button>
        ))}
        
        <button
          onClick={clearAllFilters}
          className="inline-flex items-center px-3 py-1 rounded-full bg-purple-600 text-white text-sm shadow-sm hover:bg-purple-700 transition-colors ml-auto"
        >
          Clear All Filters
          <XMarkIcon className="ml-1 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}