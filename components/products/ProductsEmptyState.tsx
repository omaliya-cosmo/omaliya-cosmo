'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ProductsEmptyStateProps {
  message?: string;
  suggestion?: string;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export default function ProductsEmptyState({
  message = "No products found",
  suggestion = "Try adjusting your filters or search terms to find what you're looking for.",
  hasFilters = false,
  onClearFilters
}: ProductsEmptyStateProps) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative elements */}
      <div className="relative mb-6">
        <motion.div 
          className="absolute -inset-3 bg-purple-100 rounded-full opacity-50"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <div className="relative bg-white p-5 rounded-full border border-purple-100 shadow-sm">
          <svg 
            className="w-10 h-10 text-purple-500" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        {message}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md">
        {suggestion}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {hasFilters && onClearFilters && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-purple-100 text-purple-700 rounded-full font-medium hover:bg-purple-200 transition-colors duration-300"
            onClick={onClearFilters}
          >
            Clear All Filters
          </motion.button>
        )}
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link 
            href="/categories" 
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 inline-flex items-center"
          >
            Browse Categories
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </Link>
        </motion.div>
      </div>
      
      {/* Decorative bottom elements */}
      <div className="mt-12 grid grid-cols-3 gap-4 max-w-xs mx-auto opacity-40">
        {[...Array(3)].map((_, i) => (
          <motion.div 
            key={i}
            className="h-24 rounded-xl bg-gray-100"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ 
              duration: 0.5,
              delay: 0.1 * i
            }}
          />
        ))}
      </div>
      <p className="text-gray-400 text-sm mt-4">
        Looking for product inspiration?
      </p>
    </motion.div>
  );
}