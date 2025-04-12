"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiShoppingCart, 
  FiArrowRight, 
  FiStar, 
  FiCheck, 
  FiHeart,
  FiEye
} from "react-icons/fi";
import { Product } from "@prisma/client";
import Cookies from "js-cookie";

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
}

type ExtendedProduct = Product & {
  rating?: number;
  reviewCount?: number;
};

const RelatedProducts: React.FC<RelatedProductsProps> = ({ 
  categoryId, 
  currentProductId 
}) => {
  const [relatedProducts, setRelatedProducts] = useState<ExtendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({});
  const [cartSuccess, setCartSuccess] = useState<Record<string, boolean>>({});
  const [hoverProduct, setHoverProduct] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        setLoading(true);
        const axios = (await import("axios")).default;
        const response = await axios.get(`/api/products`, {
          params: { categoryId, limit: 8 }
        });
        
        // Filter out the current product and add mock ratings
        const filteredProducts = response.data.products
          .filter((product: Product) => product.id !== currentProductId)
          .slice(0, 4)
          .map((product: Product) => ({
            ...product,
            // Add mock ratings for demonstration
            rating: (Math.random() * 2 + 3).toFixed(1), // Rating between 3.0-5.0
            reviewCount: Math.floor(Math.random() * 100) + 1
          }));
        
        setRelatedProducts(filteredProducts);
      } catch (error) {
        console.error("Error fetching related products:", error);
        // If API fails, just show empty state
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    }

    if (categoryId) {
      fetchRelatedProducts();
    }
  }, [categoryId, currentProductId]);

  // Format currency based on user preference
  const formatPrice = (price: number) => {
    const currency = Cookies.get("preferred-currency") || "LKR";
    
    if (currency === "USD") {
      // Convert to USD (assuming 1 USD = 300 LKR)
      const usdPrice = price / 300;
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(usdPrice);
    } else {
      // Format as LKR
      return `Rs ${price.toFixed(2)}`;
    }
  };

  // Handle add to cart
  const handleAddToCart = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (addingToCart[productId]) return;
    
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    
    // Simulate API call
    setTimeout(() => {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
      setCartSuccess(prev => ({ ...prev, [productId]: true }));
      
      // Reset success state after 1.5 seconds
      setTimeout(() => {
        setCartSuccess(prev => ({ ...prev, [productId]: false }));
      }, 1500);
    }, 800);
  };

  // Loading state with animated skeletons
  if (loading) {
    return (
      <div className="mt-16 border-t border-gray-200 pt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square bg-gray-100 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-full mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <motion.div 
      className="mt-16 border-t border-gray-200 pt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
        <Link 
          href={`/products?category=${categoryId}`}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center group"
        >
          View all
          <FiArrowRight className="ml-1 group-hover:translate-x-0.5 transition-transform" size={16} />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <AnimatePresence>
          {relatedProducts.map((product) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
              onMouseEnter={() => setHoverProduct(product.id)}
              onMouseLeave={() => setHoverProduct(null)}
            >
              {/* Product badges */}
              <div className="absolute top-3 left-3 z-10 flex gap-2">
                {product.discountPriceLKR && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    Sale
                  </span>
                )}
                
                {product.stock && product.stock < 5 && (
                  <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    Low Stock
                  </span>
                )}
              </div>
              
              {/* Product image with hover effect */}
              <Link href={`/products/${product.id}`} className="block relative">
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  {product.imageUrls && product.imageUrls.length > 0 ? (
                    <Image
                      src={product.imageUrls[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className={`object-cover object-center transition-transform duration-500 ${
                        hoverProduct === product.id ? 'scale-110' : 'scale-100'
                      }`}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                
                {/* Quick action buttons */}
                <div className={`absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 transition-opacity duration-300 ${
                  hoverProduct === product.id ? 'opacity-100' : ''
                }`}>
                  <div className="flex gap-2">
                    <button 
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                      title="Quick view"
                    >
                      <FiEye size={16} />
                    </button>
                    <button 
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                      title="Add to wishlist"
                    >
                      <FiHeart size={16} />
                    </button>
                  </div>
                </div>
              </Link>
              
              <div className="p-4">
                {/* Product rating */}
                {product.rating && (
                  <div className="flex items-center mb-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`w-3 h-3 ${
                            star <= Math.floor(Number(product.rating))
                              ? "text-yellow-400 fill-yellow-400" 
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-1 text-xs text-gray-500">
                      ({product.reviewCount})
                    </span>
                  </div>
                )}
                
                <Link href={`/products/${product.id}`}>
                  <h3 className="text-sm font-medium text-gray-900 hover:text-indigo-600 line-clamp-2 min-h-[40px]">
                    {product.name}
                  </h3>
                </Link>
                
                <div className="mt-2 flex items-center justify-between">
                  <p className="font-medium">
                    {product.discountPriceLKR ? (
                      <div>
                        <span className="text-red-600">{formatPrice(product.discountPriceLKR)}</span>
                        <span className="text-gray-500 text-xs line-through ml-1">
                          {formatPrice(product.priceLKR)}
                        </span>
                      </div>
                    ) : (
                      <span>{formatPrice(product.priceLKR)}</span>
                    )}
                  </p>
                </div>
                
                {/* Add to cart button */}
                <button
                  onClick={(e) => handleAddToCart(product.id, e)}
                  disabled={addingToCart[product.id]}
                  className={`mt-3 w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    cartSuccess[product.id]
                      ? "bg-green-500 text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {addingToCart[product.id] ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : cartSuccess[product.id] ? (
                    <>
                      <FiCheck className="mr-1" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <FiShoppingCart className="mr-1" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RelatedProducts;