"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ActiveFilter {
  label: string;
  value: string;
  param: string;
}

interface ProductsActiveFiltersProps {
  activeFilters: ActiveFilter[];
  onRemoveFilter: (param: string) => void;
  onClearAll: () => void;
  animationProps?: any;
}

export default function ProductsActiveFilters({
  activeFilters,
  onRemoveFilter,
  onClearAll,
  animationProps,
}: ProductsActiveFiltersProps) {
  if (activeFilters.length === 0) return null;

  return (
    <div className="bg-white/80 backdrop-blur-sm py-4 px-6 rounded-xl shadow-sm border border-purple-100/50 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 mr-2">Active Filters:</span>
        <AnimatePresence>
          {activeFilters.map((filter, index) => (
            <motion.div
              key={`${filter.param}-${filter.value}`}
              initial={animationProps?.initial || { scale: 0.8, opacity: 0 }}
              animate={animationProps?.animate || { scale: 1, opacity: 1 }}
              exit={animationProps?.exit || { scale: 0.8, opacity: 0 }}
              transition={animationProps?.transition || { type: "spring", stiffness: 500, damping: 30 }}
              className="inline-flex items-center gap-1 py-1 pl-3 pr-1.5 bg-gradient-to-r from-purple-100 to-purple-50 rounded-full text-sm text-purple-800 border border-purple-200 shadow-sm"
            >
              <span className="font-medium mr-1">{filter.label}:</span>
              <span className="text-purple-600">{filter.value}</span>
              <button
                onClick={() => onRemoveFilter(filter.param)}
                className="ml-1 p-1 rounded-full hover:bg-purple-200 text-purple-700 transition-colors"
                aria-label={`Remove ${filter.label} filter`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {activeFilters.length > 1 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClearAll}
            className="ml-auto text-sm font-medium text-purple-600 hover:text-pink-600 transition-colors"
          >
            Clear All
          </motion.button>
        )}
      </div>
    </div>
  );
}
