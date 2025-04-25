"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiGlobe, FiTag, FiFlag, FiAlertCircle } from "react-icons/fi";

interface ProductPricingProps {
  priceLKR: number;
  priceUSD: number;
  discountPriceLKR?: number | null;
  discountPriceUSD?: number | null;
  country?: string;
}

const ProductPricing: React.FC<ProductPricingProps> = ({
  priceLKR,
  priceUSD,
  discountPriceLKR,
  discountPriceUSD,
  country = "US",
}) => {
  // Local state for tracking loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isPriceAnimating, setIsPriceAnimating] = useState(false);

  // Determine which currency to use based on country
  const effectiveCurrency = country === "LK" ? "LKR" : "USD";

  // Only handle loading animation
  useEffect(() => {
    // Small delay to show loading animation
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  const formatCurrency = (price: number, currencyCode: string) => {
    if (currencyCode === "LKR") {
      return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
        .format(price)
        .replace("LKR", "Rs");
    } else {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    }
  };

  // Select the appropriate price based on country
  const currentPrice = country === "LK" ? priceLKR : priceUSD;
  const currentDiscountPrice =
    country === "LK" ? discountPriceLKR : discountPriceUSD;

  const hasDiscount = !!currentDiscountPrice;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((currentPrice - (currentDiscountPrice || 0)) / currentPrice) * 100
      )
    : 0;

  // Get formatted price
  const getPricePerUnit = () => {
    const effectivePrice = hasDiscount
      ? currentDiscountPrice || 0
      : currentPrice;

    return formatCurrency(effectivePrice, effectiveCurrency) + ` per unit`;
  };

  // Flag emoji and currency name helpers
  const getCurrencyFlag = (curr: string) => {
    return curr === "LKR" ? "🇱🇰" : "🇺🇸";
  };

  return (
    <motion.div
      className="mt-6 space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main pricing display */}
      <div className="relative">
        {/* Currency display (non-interactive) */}
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-600 flex items-center gap-1.5">
            <div className="bg-gray-100 rounded-full p-1.5">
              <FiGlobe className="text-gray-600" size={14} />
            </div>
            <span>
              Showing prices in:{" "}
              <span className="font-medium">
                {getCurrencyFlag(effectiveCurrency)} {effectiveCurrency}
              </span>
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading || isPriceAnimating ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2 h-12"
            >
              <div className="w-36 h-10 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-md"></div>
              <div className="w-24 h-6 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-md"></div>
            </motion.div>
          ) : (
            <motion.div
              key={`${effectiveCurrency}-${
                hasDiscount ? "discount" : "regular"
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
              className="flex items-baseline flex-wrap gap-x-4 gap-y-2"
            >
              {hasDiscount ? (
                <>
                  <div className="flex items-baseline">
                    <motion.span
                      className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-500"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {formatCurrency(
                        currentDiscountPrice || 0,
                        effectiveCurrency
                      )}
                    </motion.span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg text-gray-500 line-through">
                      {formatCurrency(currentPrice, effectiveCurrency)}
                    </span>
                    <motion.div
                      className="ml-2 px-3 py-1.5 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-lg shadow-sm"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: [0.5, 1.2, 1] }}
                      transition={{
                        duration: 0.6,
                        times: [0, 0.6, 1],
                        ease: "easeOut",
                        delay: 0.2,
                      }}
                    >
                      <span className="flex items-center">
                        {discountPercentage}% OFF
                      </span>
                    </motion.div>
                  </div>
                </>
              ) : (
                <span className="text-5xl font-bold text-gray-900">
                  {formatCurrency(currentPrice, effectiveCurrency)}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Price per unit */}
        <div className="mt-3 flex items-center">
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md inline-flex items-center">
            <FiTag className="mr-2 text-gray-500" />
            <span className="font-medium">{getPricePerUnit()}</span>
          </div>
        </div>
      </div>

      {/* Additional shipping info */}
      <div className="mt-5 text-sm pt-4">
        <div className="flex items-center mb-2">
          <div className="bg-gray-100 rounded-full p-1.5 mr-2">
            <FiFlag className="text-gray-600" size={16} />
          </div>
          <span className="font-medium text-gray-800">
            Ships from Sri Lanka
          </span>
        </div>

        {country !== "LK" && (
          <div className="ml-9 bg-amber-50 border border-amber-100 rounded-lg p-3 mt-2">
            <div className="flex items-start">
              <FiAlertCircle className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-amber-800 text-sm font-medium">
                  International Orders
                </p>
                <p className="text-amber-700 text-xs mt-1">
                  Shipping costs, import duties, and taxes will be calculated
                  during checkout. All prices are displayed without VAT for
                  international customers.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductPricing;
