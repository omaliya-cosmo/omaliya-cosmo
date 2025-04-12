import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  FiPackage, 
  FiCheck, 
  FiAlertCircle, 
  FiStar, 
  FiAward,
  FiHeart,
  FiShield,
  FiTruck,
  FiBarChart2,
  FiInfo
} from "react-icons/fi";
import { ProductCategory } from "@prisma/client";

interface ProductInfoProps {
  name: string;
  description: string;
  category?: ProductCategory;
  stock: number;
  sku?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  badges?: Array<"new" | "sale" | "eco-friendly" | "limited" | "organic">;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ 
  name, 
  description,
  category,
  stock,
  sku = "SKU-12345", // Default value for demo
  brand = "Cosmo Beauty", // Default value for demo
  rating = 4.5, // Default value for demo
  reviewCount = 24, // Default value for demo
  badges = ["eco-friendly", "organic"] // Default value for demo
}) => {
  // Get appropriate color for stock status
  const getStockStatusColor = () => {
    if (stock > 10) return 'text-green-500';
    if (stock > 0) return 'text-amber-500';
    return 'text-red-500';
  };

  // Format description
  const formatDescription = (text: string) => {
    // In a real app, you might have markdown or HTML formatting
    // For now, we'll just return paragraphs split by double newlines
    return text.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-3">{paragraph}</p>
    ));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Product badges */}
      {badges && badges.length > 0 && (
        <motion.div className="flex flex-wrap gap-2" variants={itemVariants}>
          {badges.includes("new") && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">New Arrival</span>
          )}
          {badges.includes("sale") && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">Sale</span>
          )}
          {badges.includes("eco-friendly") && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 00-1.414-1.414L7 11.586 4.707 9.293z" clipRule="evenodd" />
              </svg>
              Eco-Friendly
            </span>
          )}
          {badges.includes("limited") && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">Limited Edition</span>
          )}
          {badges.includes("organic") && (
            <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded">Organic</span>
          )}
        </motion.div>
      )}

      {/* Product name */}
      <motion.h1 
        className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight"
        variants={itemVariants}
      >
        {name}
      </motion.h1>
      
      {/* Brand and SKU */}
      <motion.div className="flex flex-wrap items-center justify-between gap-y-2" variants={itemVariants}>
        <div className="flex items-center">
          <span className="text-sm text-gray-500">Brand:</span>
          <span className="ml-2 text-sm font-medium">{brand}</span>
        </div>
        
        <div className="text-sm text-gray-500">
          SKU: <span className="font-mono">{sku}</span>
        </div>
      </motion.div>
      
      {/* Ratings */}
      <motion.div className="flex items-center" variants={itemVariants}>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <FiStar
              key={star}
              className={`${star <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
              size={18}
            />
          ))}
        </div>
        <div className="ml-2 text-sm text-gray-600">
          <span className="font-medium">{rating}</span>
          <span className="mx-1">·</span>
          <Link href="#reviews" className="hover:text-indigo-600 hover:underline">
            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </Link>
        </div>
      </motion.div>
      
      {/* Category breadcrumb */}
      {category && (
        <motion.div 
          className="flex items-center bg-gray-50 rounded-md px-3 py-2"
          variants={itemVariants}
        >
          <span className="text-sm text-gray-500">Category:</span>
          <nav className="flex" aria-label="Category navigation">
            <ol className="flex items-center space-x-1">
              <li>
                <Link 
                  href="/products"
                  className="ml-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  All Products
                </Link>
              </li>
              <li>
                <svg className="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <Link 
                  href={`/products?category=${category.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  {category.name}
                </Link>
              </li>
            </ol>
          </nav>
        </motion.div>
      )}
      
      {/* Stock status */}
      <motion.div 
        className="flex flex-wrap items-center gap-x-6 gap-y-2 border border-gray-200 rounded-md p-3"
        variants={itemVariants}
      >
        <div className={`flex items-center ${getStockStatusColor()}`}>
          {stock > 0 ? (
            <>
              <FiCheck className="mr-2" size={18} />
              <span className="font-medium">
                {stock > 10 
                  ? 'In Stock' 
                  : stock > 5 
                    ? 'Limited Stock' 
                    : 'Low Stock - Order Soon'}
              </span>
            </>
          ) : (
            <>
              <FiAlertCircle className="mr-2" size={18} />
              <span className="font-medium">Out of Stock</span>
            </>
          )}
        </div>
        
        {stock > 0 && (
          <div className="text-sm text-gray-600">
            <FiPackage className="inline mr-1" />
            <span>{stock} {stock === 1 ? 'unit' : 'units'} available</span>
          </div>
        )}

        {/* Same day delivery & Free shipping indicators */}
        {stock > 0 && (
          <div className="w-full mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600">
            {stock > 5 && (
              <div className="flex items-center">
                <FiTruck className="mr-1 text-green-500" size={14} />
                <span>
                  <span className="font-medium">Same day delivery</span> if ordered before 2pm
                </span>
              </div>
            )}
            <div className="flex items-center">
              <FiShield className="mr-1 text-indigo-500" size={14} />
              <span>Free shipping on orders over Rs 5,000</span>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Product description */}
      <motion.div 
        className="pt-5 border-t border-gray-200"
        variants={itemVariants}
      >
        <div className="flex items-center mb-3">
          <FiInfo className="text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Product Description</h2>
        </div>
        <div className="prose prose-sm text-gray-700 max-w-none">
          {formatDescription(description)}
        </div>
      </motion.div>

      {/* Key benefits */}
      <motion.div 
        className="grid grid-cols-2 gap-3 pt-4"
        variants={itemVariants}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
            <FiAward className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="ml-2 text-sm text-gray-600">Premium quality, rigorously tested</p>
        </div>
        <div className="flex items-start">
          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
            <FiHeart className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="ml-2 text-sm text-gray-600">Customers love this product</p>
        </div>
        <div className="flex items-start">
          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
            <FiShield className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="ml-2 text-sm text-gray-600">30-day money back guarantee</p>
        </div>
        <div className="flex items-start">
          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
            <FiBarChart2 className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="ml-2 text-sm text-gray-600">Top rated in its category</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductInfo;
