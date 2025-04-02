'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

const priceRanges = [
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25 to $50', min: 25, max: 50 },
  { label: '$50 to $100', min: 50, max: 100 },
  { label: '$100 to $200', min: 100, max: 200 },
  { label: 'Over $200', min: 200, max: null }
];

const categories = [
  { id: 'skincare', name: 'Skincare', count: 42 },
  { id: 'makeup', name: 'Makeup', count: 38 },
  { id: 'haircare', name: 'Haircare', count: 27 },
  { id: 'body-care', name: 'Body Care', count: 31 },
  { id: 'fragrances', name: 'Fragrances', count: 18 },
  { id: 'tools', name: 'Tools & Accessories', count: 24 }
];

const tags = [
  { id: 'vegan', name: 'Vegan', count: 57 },
  { id: 'cruelty-free', name: 'Cruelty-Free', count: 105 },
  { id: 'organic', name: 'Organic', count: 83 },
  { id: 'natural', name: 'Natural', count: 91 },
  { id: 'eco-friendly', name: 'Eco-Friendly', count: 64 },
  { id: 'sensitive-skin', name: 'Sensitive Skin', count: 45 }
];

export default function ProductFilterSidebar({ currentParams = {}, productCount = 0 }) {
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Manage expanded filter sections
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    rating: true,
    tags: true,
    availability: true
  });
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Apply filters
  const applyFilters = (newParams: Record<string, string | undefined>) => {
    // Merge with existing params, except for the ones we're explicitly setting
    const params = new URLSearchParams();
    
    // Add current params
    Object.entries(currentParams).forEach(([key, value]) => {
      if (value && !Object.keys(newParams).includes(key)) {
        params.append(key, String(value));
      }
    });
    
    // Add new params
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    router.push(`/products?${params.toString()}`);
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    router.push('/products');
  };
  
  // Clear a specific filter
  const clearFilter = (param) => {
    const params = new URLSearchParams();
    
    Object.entries(currentParams).forEach(([key, value]) => {
      if (key !== param) {
        params.append(key, value);
      }
    });
    
    router.push(`/products?${params.toString()}`);
  };
  
  // Set price range
  const setPriceRange = (min, max) => {
    applyFilters({
      minPrice: min,
      maxPrice: max === null ? undefined : max
    });
  };
  
  // Set rating filter
  const setRating = (rating) => {
    applyFilters({ rating });
  };
  
  // Toggle a tag
  const toggleTag = (tagId) => {
    const currentTags = currentParams.tags ? currentParams.tags.split(',') : [];
    let newTags;
    
    if (currentTags.includes(tagId)) {
      newTags = currentTags.filter(t => t !== tagId);
    } else {
      newTags = [...currentTags, tagId];
    }
    
    applyFilters({ tags: newTags.length ? newTags.join(',') : undefined });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 sticky top-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        
        {Object.keys(currentParams).length > 1 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            Clear all
          </button>
        )}
      </div>
      
      {/* Categories Filter */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <button
          className="flex justify-between items-center w-full text-left"
          onClick={() => toggleSection('category')}
        >
          <h3 className="text-sm font-medium text-gray-900">Categories</h3>
          <span className="text-purple-600">
            {expandedSections.category ? '-' : '+'}
          </span>
        </button>
        
        <AnimatePresence>
          {expandedSections.category && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 space-y-2 overflow-hidden"
            >
              {categories.map((category) => (
                <div key={category.id} className="flex items-center">
                  <input
                    id={`category-${category.id}`}
                    name="category"
                    type="radio"
                    checked={currentParams.category === category.id}
                    onChange={() => applyFilters({ category: category.id })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`category-${category.id}`} className="ml-3 text-sm text-gray-600 cursor-pointer flex-grow">
                    {category.name}
                  </label>
                  <span className="text-xs text-gray-500">{category.count}</span>
                </div>
              ))}
              
              {currentParams.category && (
                <button
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium mt-2 flex items-center"
                  onClick={() => clearFilter('category')}
                >
                  <XMarkIcon className="h-3 w-3 mr-1" />
                  Clear category
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Price Filter */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <button
          className="flex justify-between items-center w-full text-left"
          onClick={() => toggleSection('price')}
        >
          <h3 className="text-sm font-medium text-gray-900">Price Range</h3>
          <span className="text-purple-600">
            {expandedSections.price ? '-' : '+'}
          </span>
        </button>
        
        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 space-y-2 overflow-hidden"
            >
              {priceRanges.map((range, index) => (
                <div key={index} className="flex items-center">
                  <input
                    id={`price-${index}`}
                    name="price"
                    type="radio"
                    checked={
                      Number(currentParams.minPrice) === range.min && 
                      (range.max === null ? !currentParams.maxPrice : Number(currentParams.maxPrice) === range.max)
                    }
                    onChange={() => setPriceRange(range.min, range.max)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`price-${index}`} className="ml-3 text-sm text-gray-600 cursor-pointer">
                    {range.label}
                  </label>
                </div>
              ))}
              
              {(currentParams.minPrice || currentParams.maxPrice) && (
                <button
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium mt-2 flex items-center"
                  onClick={() => {
                    clearFilter('minPrice');
                    clearFilter('maxPrice');
                  }}
                >
                  <XMarkIcon className="h-3 w-3 mr-1" />
                  Clear price
                </button>
              )}
              
              {/* Custom price range */}
              <div className="mt-4 flex space-x-2">
                <div>
                  <label htmlFor="min-price" className="sr-only">Minimum Price</label>
                  <input
                    type="number"
                    id="min-price"
                    placeholder="Min"
                    min="0"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    defaultValue={currentParams.minPrice}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        applyFilters({ minPrice: target.value });
                      }
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="max-price" className="sr-only">Maximum Price</label>
                  <input
                    type="number"
                    id="max-price"
                    placeholder="Max"
                    min="0"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    defaultValue={currentParams.maxPrice}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        applyFilters({ maxPrice: target.value });
                      }
                    }}
                  />
                </div>
                <button
                  className="bg-purple-100 text-purple-700 px-3 rounded-md text-sm font-medium hover:bg-purple-200 transition-colors"
                  onClick={() => {
                    const minInput = document.getElementById('min-price') as HTMLInputElement;
                    const maxInput = document.getElementById('max-price') as HTMLInputElement;
                    applyFilters({
                      minPrice: minInput.value,
                      maxPrice: maxInput.value
                    });
                  }}
                >
                  Go
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Rating Filter */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <button
          className="flex justify-between items-center w-full text-left"
          onClick={() => toggleSection('rating')}
        >
          <h3 className="text-sm font-medium text-gray-900">Rating</h3>
          <span className="text-purple-600">
            {expandedSections.rating ? '-' : '+'}
          </span>
        </button>
        
        <AnimatePresence>
          {expandedSections.rating && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 space-y-3 overflow-hidden"
            >
              {[4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center">
                  <input
                    id={`rating-${star}`}
                    name="rating"
                    type="radio"
                    checked={Number(currentParams.rating) === star}
                    onChange={() => setRating(star)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`rating-${star}`} className="ml-3 text-sm text-gray-600 cursor-pointer flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${i < star ? 'text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="ml-1">& Up</span>
                  </label>
                </div>
              ))}
              
              {currentParams.rating && (
                <button
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium mt-2 flex items-center"
                  onClick={() => clearFilter('rating')}
                >
                  <XMarkIcon className="h-3 w-3 mr-1" />
                  Clear rating
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Tags Filter */}
      <div className="mb-6 border-b border-gray-200 pb-6">
        <button
          className="flex justify-between items-center w-full text-left"
          onClick={() => toggleSection('tags')}
        >
          <h3 className="text-sm font-medium text-gray-900">Product Tags</h3>
          <span className="text-purple-600">
            {expandedSections.tags ? '-' : '+'}
          </span>
        </button>
        
        <AnimatePresence>
          {expandedSections.tags && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 flex flex-wrap gap-2 overflow-hidden"
            >
              {tags.map((tag) => {
                const isSelected = currentParams.tags?.split(',').includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      isSelected 
                        ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {tag.name} ({tag.count})
                  </button>
                );
              })}
              
              {currentParams.tags && (
                <button
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium mt-2 flex items-center"
                  onClick={() => clearFilter('tags')}
                >
                  <XMarkIcon className="h-3 w-3 mr-1" />
                  Clear tags
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Availability Filter */}
      <div className="mb-6">
        <button
          className="flex justify-between items-center w-full text-left"
          onClick={() => toggleSection('availability')}
        >
          <h3 className="text-sm font-medium text-gray-900">Availability</h3>
          <span className="text-purple-600">
            {expandedSections.availability ? '-' : '+'}
          </span>
        </button>
        
        <AnimatePresence>
          {expandedSections.availability && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 space-y-4 overflow-hidden"
            >
              <div className="flex items-center">
                <input
                  id="inStock"
                  name="inStock"
                  type="checkbox"
                  checked={currentParams.inStock === 'true'}
                  onChange={() => applyFilters({ inStock: currentParams.inStock === 'true' ? undefined : 'true' })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="inStock" className="ml-3 text-sm text-gray-600 cursor-pointer">
                  In Stock Only
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="onSale"
                  name="onSale"
                  type="checkbox"
                  checked={currentParams.onSale === 'true'}
                  onChange={() => applyFilters({ onSale: currentParams.onSale === 'true' ? undefined : 'true' })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="onSale" className="ml-3 text-sm text-gray-600 cursor-pointer">
                  On Sale
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Product count */}
      <div className="pt-2 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Showing {productCount} {productCount === 1 ? 'product' : 'products'}
        </p>
      </div>
    </div>
  );
}