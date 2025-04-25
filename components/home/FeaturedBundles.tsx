"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Package,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-toastify";
import {
  BundleOffer as PrismaBundleOffer,
  ProductsOnBundles as PrismaProductsOnBundles,
  Product,
} from "@prisma/client";
import { useCart } from "@/app/lib/context/CartContext";

interface ProductsOnBundles extends PrismaProductsOnBundles {
  product: Product;
}

interface BundleOffer extends PrismaBundleOffer {
  products: ProductsOnBundles[];
}

interface FeaturedBundlesProps {
  bundles: BundleOffer[];
  loading: boolean;
  error: string | null;
  country: string;
}

const FeaturedBundles = ({
  bundles,
  loading,
  error,
  country,
}: FeaturedBundlesProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const isLKR = country === "LK";
  const { refreshCart } = useCart();

  // Helper functions for price display
  const getPrice = (bundle: BundleOffer) => {
    return isLKR ? bundle.offerPriceLKR : bundle.offerPriceUSD;
  };

  const getOriginalPrice = (bundle: BundleOffer) => {
    return isLKR ? bundle.originalPriceLKR : bundle.originalPriceUSD;
  };

  const getCurrencySymbol = () => {
    return isLKR ? "Rs. " : "$";
  };

  const getProductPrice = (product: Product) => {
    return isLKR ? product.priceLKR : product.priceUSD;
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === bundles.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? bundles.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const addBundleToCart = async (bundle: BundleOffer) => {
    try {
      // In a real app, you would have an API endpoint to handle bundle additions
      await axios.post("/api/cart", {
        productId: bundle.id,
        quantity: 1,
        isBundle: true,
      });

      await refreshCart(); // Refresh the cart context after adding the bundle

      toast.success(`Added ${bundle.bundleName} to your cart!`, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error adding bundle to cart";
      toast.error(errorMessage, {
        position: "bottom-right",
      });
    }
  };

  // Calculate savings percentage for display
  const calculateSavingsPercentage = (
    originalPrice: number,
    offerPrice: number
  ) => {
    if (originalPrice <= 0) return 0;
    return Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-purple-50 via-white to-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Bundles
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Loading bundles...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="bg-gray-200 h-48 w-96 rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 bg-gradient-to-b from-purple-50 via-white to-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Bundles
            </h2>
            <p className="text-red-600">
              Error loading bundles. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state - no bundles
  if (bundles.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-b from-purple-50 via-white to-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Bundles
            </h2>
            <p className="text-gray-600">No bundles available at this time.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-purple-50 via-white to-white relative overflow-hidden">
      {/* Animated Background Elements - Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large blurred background gradient */}
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-r from-purple-100/40 to-pink-100/40 blur-3xl"
          style={{ top: "10%", left: "50%", x: "-50%" }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            repeat: Infinity,
            duration: 15,
            ease: "easeInOut",
          }}
        />

        {/* Floating particles - various sizes and positions */}
        <motion.div
          className="absolute w-12 h-12 rounded-full bg-purple-200"
          style={{ top: "15%", left: "10%" }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-8 h-8 rounded-full bg-pink-200"
          style={{ top: "30%", right: "15%" }}
          animate={{
            y: [0, 25, 0],
            x: [0, -15, 0],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-16 h-16 rounded-full bg-purple-100"
          style={{ bottom: "20%", left: "20%" }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: 12,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-10 h-10 rounded-full bg-pink-100"
          style={{ bottom: "30%", right: "25%" }}
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            repeat: Infinity,
            duration: 9,
            ease: "easeInOut",
          }}
        />

        {/* Additional smaller particles */}
        <motion.div
          className="absolute w-6 h-6 rounded-full bg-purple-300"
          style={{ top: "55%", left: "8%" }}
          animate={{
            y: [0, 15, 0],
            x: [0, 8, 0],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            repeat: Infinity,
            duration: 7,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-5 h-5 rounded-full bg-pink-300"
          style={{ top: "70%", right: "12%" }}
          animate={{
            y: [0, -12, 0],
            x: [0, -6, 0],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
          }}
        />

        {/* Gradient-filled particles with blur */}
        <motion.div
          className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-purple-200 to-pink-200 blur-sm"
          style={{ top: "40%", right: "5%" }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 blur-sm"
          style={{ bottom: "10%", left: "5%" }}
          animate={{
            scale: [1, 0.9, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured Bundles
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our expertly crafted product bundles designed to work
            perfectly together — at special savings.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-7xl mx-auto">
          {/* Navigation Arrows */}
          <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-4 md:-translate-x-6">
            <button
              onClick={prevSlide}
              className="bg-white p-2 rounded-full shadow-lg hover:bg-purple-100 transition-colors"
              aria-label="Previous bundle"
            >
              <ChevronLeftIcon className="w-6 h-6 text-purple-800" />
            </button>
          </div>

          <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-4 md:translate-x-6">
            <button
              onClick={nextSlide}
              className="bg-white p-2 rounded-full shadow-lg hover:bg-purple-100 transition-colors"
              aria-label="Next bundle"
            >
              <ChevronRightIcon className="w-6 h-6 text-purple-800" />
            </button>
          </div>

          {/* Carousel Content */}
          <div className="overflow-hidden">
            <motion.div
              ref={carouselRef}
              className="flex"
              animate={{ x: -currentIndex * 100 + "%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {bundles.map((bundle) => (
                <div
                  key={bundle.id}
                  className="min-w-full w-full flex flex-col md:flex-row gap-8 px-4"
                >
                  {/* Bundle Image */}
                  <div className="w-full md:w-1/2 overflow-hidden rounded-xl">
                    <div className="relative aspect-[4/3] w-full">
                      {bundle.imageUrl ? (
                        <div
                          className="h-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url('${bundle.imageUrl}')`,
                            backgroundColor: "rgba(0,0,0,0.05)",
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center bg-muted">
                          <Package className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Save{" "}
                        {calculateSavingsPercentage(
                          getOriginalPrice(bundle),
                          getPrice(bundle)
                        )}
                        %
                      </div>
                    </div>
                  </div>

                  {/* Bundle Details */}
                  <div className="w-full md:w-1/2 flex flex-col justify-center">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3">
                      {bundle.bundleName}
                    </h3>
                    <p className="text-gray-600 mb-5">
                      {`Special bundle offer with ${bundle.products.length} products.`}
                    </p>

                    <div className="flex items-center mb-6">
                      <span className="text-3xl font-bold text-purple-800 mr-3">
                        {getCurrencySymbol()}
                        {getPrice(bundle).toFixed(2)}
                      </span>
                      <span className="text-xl line-through text-gray-500">
                        {getCurrencySymbol()}
                        {getOriginalPrice(bundle).toFixed(2)}
                      </span>
                    </div>

                    {/* Included Products */}
                    <div className="mb-8">
                      <h4 className="font-medium mb-3">Includes:</h4>
                      <ul className="text-sm space-y-2">
                        {bundle.products.slice(0, 3).map((productItem, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-primary" />
                            {productItem.product.name} - {getCurrencySymbol()}
                            {getProductPrice(productItem.product).toFixed(2)}
                          </li>
                        ))}
                        {bundle.products.length > 3 && (
                          <li className="text-sm text-muted-foreground">
                            + {bundle.products.length - 3} more items
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-wrap gap-4">
                      <Button
                        onClick={() => addBundleToCart(bundle)}
                        className="bg-purple-800 hover:bg-purple-900 gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add Bundle to Cart
                      </Button>
                      <Link href={`/bundles/${bundle.id}`} passHref>
                        <Button
                          variant="outline"
                          className="border-purple-800 text-purple-800 hover:bg-purple-50"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dots navigation */}
          <div className="flex justify-center mt-8 gap-2">
            {bundles.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentIndex === index ? "bg-purple-800" : "bg-gray-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* View All Bundles Button */}
        <div className="text-center mt-10">
          <Link href="/bundles">
            <Button
              variant="outline"
              className="border-purple-800 text-purple-800 hover:bg-purple-50"
            >
              View All Bundles
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBundles;
