"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import { 
  FiCreditCard, 
  FiInfo, 
  FiFlag, 
  FiShield, 
  FiCheck,
  FiClock,
  FiPercent,
  FiAlertCircle,
  FiArrowRight,
  FiTag,
  FiTruck,
  FiRefreshCw,
  FiGlobe
} from "react-icons/fi";

interface ProductPricingProps {
  priceLKR: number;
  priceUSD: number;
  discountPriceLKR?: number | null;
  discountPriceUSD?: number | null;
  currency: "LKR" | "USD";
  onCurrencyChange: (currency: "LKR" | "USD") => void;
  weight?: number;
  weightUnit?: string;
}

const ProductPricing: React.FC<ProductPricingProps> = ({
  priceLKR,
  priceUSD,
  discountPriceLKR,
  discountPriceUSD,
  currency,
  onCurrencyChange,
  weight = 100,
  weightUnit = "g"
}) => {
  // Local state for tracking loading state
  const [isLoading, setIsLoading] = useState(true);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [isPriceAnimating, setIsPriceAnimating] = useState(false);
  
  // Sale countdown state
  const [countdown, setCountdown] = useState({
    days: 2,
    hours: 8,
    minutes: 45,
    seconds: 30
  });
  
  // Load currency preference from cookie on component mount
  useEffect(() => {
    // Get the saved currency from cookies
    const savedCurrency = Cookies.get("preferred-currency");
    
    // If there's a valid saved currency, use it
    if (savedCurrency && (savedCurrency === "LKR" || savedCurrency === "USD")) {
      onCurrencyChange(savedCurrency);
    } else {
      // If no cookie is set, set the default to LKR and save it
      Cookies.set("preferred-currency", "LKR", { expires: 365 });
      onCurrencyChange("LKR");
    }
    
    // Small delay to show loading animation
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, [onCurrencyChange]);

  // Simple countdown timer effect
  useEffect(() => {
    if (!hasDiscount) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { days, hours, minutes, seconds } = prev;
        seconds -= 1;
        
        if (seconds < 0) {
          seconds = 59;
          minutes -= 1;
        }
        
        if (minutes < 0) {
          minutes = 59;
          hours -= 1;
        }
        
        if (hours < 0) {
          hours = 23;
          days -= 1;
        }
        
        if (days < 0) {
          // Sale ended
          clearInterval(timer);
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (price: number, currencyCode: string) => {
    if (currencyCode === "LKR") {
      return new Intl.NumberFormat('en-LK', { 
        style: 'currency', 
        currency: 'LKR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      }).format(price).replace('LKR', 'Rs');
    } else {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      }).format(price);
    }
  };

  const currentPrice = currency === "LKR" ? priceLKR : priceUSD;
  const currentDiscountPrice = currency === "LKR" ? discountPriceLKR : discountPriceUSD;
  
  const hasDiscount = !!currentDiscountPrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((currentPrice - (currentDiscountPrice || 0)) / currentPrice) * 100) 
    : 0;
  
  const savings = hasDiscount 
    ? (currentPrice - (currentDiscountPrice || 0))
    : 0;

  // Calculate price per unit
  const getPricePerUnit = () => {
    const effectivePrice = hasDiscount ? (currentDiscountPrice || 0) : currentPrice;
    const pricePerUnit = effectivePrice / weight;
    
    return formatCurrency((pricePerUnit * 1000), currency) + ` per kg`;
  };

  // Calculate installment amounts (for demo purposes)
  const monthlyInstallment = hasDiscount 
    ? (currentDiscountPrice || 0) / 3 
    : currentPrice / 3;

  // Flag emoji and currency name helpers
  const getCurrencyFlag = (curr: string) => {
    return curr === "LKR" ? "🇱🇰" : "🇺🇸";
  };
  
  const getCurrencyName = (curr: string) => {
    return curr === "LKR" ? "Sri Lankan Rupee (LKR)" : "US Dollar (USD)";
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
            <span>Showing prices in: <span className="font-medium">{getCurrencyFlag(currency)} {currency}</span></span>
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
              key={`${currency}-${hasDiscount ? 'discount' : 'regular'}`}
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
                      {formatCurrency(currentDiscountPrice || 0, currency)}
                    </motion.span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg text-gray-500 line-through">
                      {formatCurrency(currentPrice, currency)}
                    </span>
                    <motion.div 
                      className="ml-2 px-3 py-1.5 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-lg shadow-sm"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: [0.5, 1.2, 1] }}
                      transition={{ 
                        duration: 0.6, 
                        times: [0, 0.6, 1],
                        ease: "easeOut",
                        delay: 0.2
                      }}
                    >
                      <span className="flex items-center">
                        <FiPercent className="mr-1" size={14} />
                        {discountPercentage}% OFF
                      </span>
                    </motion.div>
                  </div>
                </>
              ) : (
                <span className="text-5xl font-bold text-gray-900">
                  {formatCurrency(currentPrice, currency)}
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

      {/* Price info & details */}
      <motion.div 
        className="rounded-xl overflow-hidden shadow-sm border border-indigo-100 mt-5 bg-gradient-to-br from-indigo-50 to-white"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2 mr-3">
              <FiInfo className="text-indigo-600" />
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-indigo-900">Price Details</h4>
              
              <div className="text-sm text-indigo-800">
                <div className="flex items-center text-sm">
                  <FiCheck className="mr-2 text-green-500" />
                  <span>Price inclusive of all taxes</span>
                </div>
                                
                {hasDiscount && (
                  <div className="flex items-center mt-1 text-sm">
                    <FiCheck className="mr-2 text-green-500" />
                    <span>
                      You save <span className="font-semibold text-green-600">{formatCurrency(savings, currency)}</span>
                    </span>
                  </div>
                )}
              </div>
              
              {/* Installment options */}
              <div className="mt-3 pt-3 border-t border-indigo-100">
                <div className="flex items-center mb-2">
                  <FiCreditCard className="mr-2 text-indigo-500" />
                  <h5 className="font-medium text-indigo-900">Payment Options</h5>
                </div>
                
                <div className="bg-white rounded-lg p-3 shadow-sm border border-indigo-100">
                  <div className="flex items-start">
                    <div className="bg-indigo-100 p-2 rounded-md mt-1 mr-3">
                      <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1 10H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">3 interest-free installments</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Pay <span className="font-medium text-indigo-600">{formatCurrency(monthlyInstallment, currency)}</span>/month for 3 months
                      </div>
                      <div className="flex items-center mt-2 text-xs text-indigo-600 font-medium">
                        <FiArrowRight size={12} className="mr-1" />
                        <span>See all payment options</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Shipping options preview */}
                <div className="mt-3 pt-3 border-t border-indigo-100">
                  <div className="flex items-center mb-2">
                    <FiTruck className="mr-2 text-indigo-500" />
                    <h5 className="font-medium text-indigo-900">Shipping</h5>
                  </div>
                  
                  <div className="flex flex-col space-y-2 text-sm">
                    <div className="flex items-center bg-white rounded-md p-2 border border-gray-100">
                      <div className="flex-shrink-0 w-4 h-4 bg-green-100 rounded-full mr-2 flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      {currency === "LKR" ? (
                        <span>Free delivery in Colombo (2-3 days)</span>
                      ) : (
                        <span>International shipping available (7-14 days)</span>
                      )}
                    </div>
                    <div className="flex items-center bg-white rounded-md p-2 border border-gray-100">
                      <div className="flex-shrink-0 w-4 h-4 bg-green-100 rounded-full mr-2 flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="flex items-center">
                        <FiRefreshCw className="mr-1 text-gray-500" size={12} />
                        <span>Easy 30-day returns</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sale countdown if there's a discount */}
      {hasDiscount && (
        <motion.div 
          className="mt-5 overflow-hidden rounded-xl shadow-sm border border-red-200 bg-gradient-to-r from-red-50 to-pink-50"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-red-100 rounded-full p-2 mr-3">
                <FiClock className="text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-red-900">Limited Time Offer</h4>
                <p className="text-sm text-red-700 mt-1">
                  Hurry! This special price is available for a limited time only.
                </p>
                
                {/* Animated countdown timer */}
                <div className="mt-3 flex items-center justify-center space-x-2">
                  <div className="flex flex-col items-center">
                    <div className="bg-white w-12 h-12 flex items-center justify-center rounded-lg shadow-sm border border-red-100 text-lg font-bold text-red-700">
                      {countdown.days.toString().padStart(2, '0')}
                    </div>
                    <span className="text-xs text-red-600 mt-1">Days</span>
                  </div>
                  <span className="text-red-600 font-bold text-xl mt-2">:</span>
                  <div className="flex flex-col items-center">
                    <div className="bg-white w-12 h-12 flex items-center justify-center rounded-lg shadow-sm border border-red-100 text-lg font-bold text-red-700">
                      {countdown.hours.toString().padStart(2, '0')}
                    </div>
                    <span className="text-xs text-red-600 mt-1">Hours</span>
                  </div>
                  <span className="text-red-600 font-bold text-xl mt-2">:</span>
                  <div className="flex flex-col items-center">
                    <div className="bg-white w-12 h-12 flex items-center justify-center rounded-lg shadow-sm border border-red-100 text-lg font-bold text-red-700">
                      {countdown.minutes.toString().padStart(2, '0')}
                    </div>
                    <span className="text-xs text-red-600 mt-1">Minutes</span>
                  </div>
                  <span className="text-red-600 font-bold text-xl mt-2">:</span>
                  <div className="flex flex-col items-center">
                    <motion.div 
                      className="bg-white w-12 h-12 flex items-center justify-center rounded-lg shadow-sm border border-red-100 text-lg font-bold text-red-700"
                      key={countdown.seconds}
                      initial={{ opacity: 0.7 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {countdown.seconds.toString().padStart(2, '0')}
                    </motion.div>
                    <span className="text-xs text-red-600 mt-1">Seconds</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Additional shipping info */}
      <div className="mt-5 text-sm pt-4">
        <div className="flex items-center mb-2">
          <div className="bg-gray-100 rounded-full p-1.5 mr-2">
            <FiFlag className="text-gray-600" size={16} />
          </div>
          <span className="font-medium text-gray-800">Ships from Sri Lanka</span>
        </div>
        
        {currency === "USD" && (
          <div className="ml-9 bg-amber-50 border border-amber-100 rounded-lg p-3 mt-2">
            <div className="flex items-start">
              <FiAlertCircle className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-amber-800 text-sm font-medium">International Orders</p>
                <p className="text-amber-700 text-xs mt-1">
                  Shipping costs, import duties, and taxes will be calculated during checkout.
                  All prices are displayed without VAT for international customers.
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