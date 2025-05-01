"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Package,
  ShoppingCart,
  Share2,
  CheckCircle,
  Star,
  Heart,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";

// Import components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import BundleAddToCartButton from "@/components/bundle-detail/BundleAddToCartButton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BundleOffer as PrismaBundleOffer,
  Product as PrismaProduct,
  ProductsOnBundles as PrismaProductsOnBundles,
  ProductCategory,
  Review,
} from "@prisma/client";
import { useCountry } from "@/app/lib/hooks/useCountry";
import ProductCard from "@/components/shared/ProductCard";
import { useCart } from "@/app/lib/hooks/CartContext";

interface Product extends PrismaProduct {
  category: ProductCategory;
  reviews: Review[];
}

interface ProductsOnBundles extends PrismaProductsOnBundles {
  product: Product;
}

interface BundleOffer extends PrismaBundleOffer {
  products: ProductsOnBundles[];
}

export default function BundleDetailPage() {
  const { bundleId } = useParams();
  const [bundle, setBundle] = useState<BundleOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { country } = useCountry();
  const { refreshCart } = useCart();

  // Add state for related bundles
  const [relatedBundles, setRelatedBundles] = useState<BundleOffer[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch bundle data from the API
        const response = await axios.get("/api/bundleoffers");

        // Find the specific bundle by ID
        const currentBundle = response.data.find(
          (bundle: BundleOffer) => bundle.id === bundleId
        );

        if (currentBundle) {
          setBundle(currentBundle);
          // Set related bundles (excluding current bundle)
          setRelatedBundles(
            response.data
              .filter((b: BundleOffer) => b.id !== bundleId)
              .slice(0, 3)
          );
        } else {
          setError("Bundle not found");
        }
      } catch (error) {
        console.error("Error fetching bundle:", error);
        setError("Failed to load bundle details");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [bundleId]);

  // Calculate savings
  const calculateSavings = () => {
    if (!bundle) return { amount: 0, percentage: 0 };

    // Use appropriate price values based on country
    const originalPrice =
      country === "LK" ? bundle.originalPriceLKR : bundle.originalPriceUSD;
    const offerPrice =
      country === "LK" ? bundle.offerPriceLKR : bundle.offerPriceUSD;

    const savings = originalPrice - offerPrice;
    const percentage = Math.round((savings / originalPrice) * 100);

    return { amount: savings, percentage };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div>
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded mb-8 w-4/6"></div>
              <div className="h-12 bg-gray-200 rounded mb-6 w-1/3"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 p-6 rounded-lg text-center">
          <h2 className="text-xl font-medium text-red-600 mb-2">
            {error || "Bundle not found"}
          </h2>
          <p className="text-red-500 mb-4">
            We couldn't find the bundle you're looking for.
          </p>
          <Link
            href="/bundles"
            className="inline-block bg-pink-600 text-white px-5 py-2.5 rounded-md hover:bg-pink-700"
          >
            Return to Bundles
          </Link>
        </div>
      </div>
    );
  }

  interface CartProduct {
    id: string;
    name: string;
  }

  const addToCart = async (product: CartProduct) => {
    try {
      await axios.post("/api/cart", {
        productId: product.id,
        quantity: 1,
      });

      // Refresh cart data in the context
      await refreshCart();

      toast.success(`Added ${product.name} to your cart!`, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error adding to cart";
      toast.error(errorMessage, {
        position: "bottom-right",
      });
    }
  };

  const { amount: savings, percentage: savingsPercentage } = calculateSavings();

  // Get category name from first product if available
  const category = bundle.products[0]?.product?.category?.name || "beauty";

  // Image variants for animation
  const imageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <main className="bg-white">
      <ToastContainer />

      {/* Hero Section with animated background elements */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 relative overflow-hidden">
        {/* Animated background decorative elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-purple-200 rounded-full opacity-50 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-pink-200 rounded-full opacity-40 blur-3xl"
        />

        {/* Floating particles with various sizes and positions */}
        <motion.div
          className="absolute w-10 h-10 rounded-full bg-purple-200/70"
          style={{ top: "15%", left: "10%" }}
          animate={{
            y: [-30, 0, -30],
            x: [20, 0, 20],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            repeat: Infinity,
            duration: 12,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-8 h-8 rounded-full bg-pink-200/60"
          style={{ bottom: "20%", right: "15%" }}
          animate={{
            y: [0, 25, 0],
            x: [0, -15, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut",
          }}
        />

        <div className="container mx-auto px-12 md:px-24 relative z-10">
          {/* Breadcrumbs */}
          <Breadcrumb className="">
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <span className="hover:text-purple-600 transition-colors">
                  Home
                </span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/bundles">
                <span className="hover:text-purple-600 transition-colors">
                  Bundles
                </span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink isActive>
                <span className="font-medium">{bundle.bundleName}</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </div>
      </section>

      <div className="container mx-auto px-12 md:px-24 py-8 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {/* Left column: Bundle image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-square bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl overflow-hidden shadow-md group"
          >
            {/* Gradient background for visual appeal */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/40 to-pink-100/40"></div>

            {/* Loading indicator */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-16 h-16">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 rounded-full animate-pulse"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
                </div>
              </div>
            )}

            {/* Bundle image with animation */}
            <motion.div
              initial="hidden"
              animate={imageLoaded ? "visible" : "hidden"}
              variants={imageVariants}
              className="h-full w-full z-10"
            >
              {bundle.imageUrl ? (
                <Image
                  src={bundle.imageUrl}
                  alt={bundle.bundleName}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  onLoad={() => setImageLoaded(true)}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  onLoad={() => setImageLoaded(true)}
                >
                  <Package className="h-32 w-32 text-purple-300" />
                </div>
              )}
            </motion.div>

            {/* Savings badge */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold z-10 shadow-md">
              Save {savingsPercentage}%
            </div>
          </motion.div>

          {/* Right column: Bundle info and actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Category and tags */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 hover:from-purple-200 hover:to-pink-200 border-none">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Badge>

              <Badge
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                Bundle Offer
              </Badge>
            </div>

            {/* Bundle name and rating */}
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-pink-700">
                {bundle.bundleName}
              </h1>
              <div className="flex items-center mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < 4
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  4.0 (12 reviews)
                </span>
              </div>
            </div>

            {/* Bundle description */}
            <p className="text-gray-600 mb-6">
              A curated collection of our best products at a special price
            </p>

            {/* Pricing section */}
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100/50 shadow-sm">
              <div className="flex items-baseline flex-wrap">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700">
                  {country === "LK" ? "Rs." : "$"}
                  {(country === "LK"
                    ? bundle.offerPriceLKR
                    : bundle.offerPriceUSD
                  ).toFixed(2)}
                </span>
                <span className="ml-2 text-lg line-through text-gray-500">
                  {country === "LK" ? "Rs." : "$"}
                  {(country === "LK"
                    ? bundle.originalPriceLKR
                    : bundle.originalPriceUSD
                  ).toFixed(2)}
                </span>
                <span className="ml-2 text-sm text-green-600 font-medium">
                  You save: {country === "LK" ? "Rs." : "$"}
                  {savings.toFixed(2)} ({savingsPercentage}%)
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Price includes all applicable taxes
              </p>
            </div>

            {/* Bundle contents */}
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-3">
                Bundle Contains:
              </h3>
              <ul className="space-y-2 divide-y divide-gray-100">
                {bundle.products.map((productItem) => (
                  <li
                    key={productItem.id}
                    className="flex justify-between py-2"
                  >
                    <span className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="text-gray-800">
                        {productItem.product.name}
                      </span>
                    </span>
                    <span className="text-gray-600 font-medium">
                      {country === "LK" ? "Rs." : "$"}
                      {(country === "LK"
                        ? productItem.product.priceLKR
                        : productItem.product.priceUSD
                      ).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 space-y-4">
              {/* Quantity selector */}
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Quantity:</span>
                <div className="flex border border-gray-300 rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 border-r border-gray-300"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-16 text-center py-1 focus:outline-none"
                    disabled
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 border-l border-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to cart button */}
              <BundleAddToCartButton
                bundle={bundle}
                quantity={quantity}
                country={country}
              />
            </div>
          </motion.div>
        </div>

        {/* Products in this bundle */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Products in This Bundle</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bundle.products.map((productItem) => (
              <ProductCard
                product={productItem.product}
                addToCart={addToCart}
                country={country}
              />
            ))}
          </div>
        </div>

        {/* You may also like section */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-pink-700">
              You May Also Like
            </h2>
            <Link href="/bundles">
              <Button
                variant="link"
                className="text-purple-600 hover:text-pink-600 transition-colors"
              >
                View All Bundles
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedBundles.map((relatedBundle) => (
              <motion.div
                key={relatedBundle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -5 }}
                className="h-full"
              >
                <Card className="h-full flex flex-col overflow-hidden border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300">
                  <div
                    className="relative overflow-hidden"
                    style={{ height: "240px" }}
                  >
                    {relatedBundle.imageUrl ? (
                      <div
                        className="h-full bg-cover bg-center transform transition-transform duration-700 hover:scale-110"
                        style={{
                          backgroundImage: `url('${relatedBundle.imageUrl}')`,
                          backgroundColor: "rgba(0,0,0,0.05)",
                        }}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                        <Package className="h-16 w-16 text-purple-300" />
                      </div>
                    )}

                    {/* Calculate savings for the related bundle */}
                    {(() => {
                      const savingsPercent = Math.round(
                        ((relatedBundle.originalPriceLKR -
                          relatedBundle.offerPriceLKR) /
                          relatedBundle.originalPriceLKR) *
                          100
                      );

                      return (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-none font-medium shadow-md">
                            Save {savingsPercent}%
                          </Badge>
                        </div>
                      );
                    })()}
                  </div>
                  <CardContent className="p-6 flex-grow">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold mb-3 transition-colors">
                        <Link
                          href={`/bundles/${relatedBundle.id}`}
                          className="hover:text-purple-600 bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                        >
                          {relatedBundle.bundleName}
                        </Link>
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {`Collection of ${relatedBundle.products.length} products at a special price`}
                      </p>
                    </div>

                    <Separator className="my-4 bg-gradient-to-r from-transparent via-purple-200 to-transparent h-px" />

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-800">
                        Includes:
                      </p>
                      <ul className="text-sm space-y-2">
                        {relatedBundle.products
                          .slice(0, 3)
                          .map((productItem, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 text-gray-700"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                              {productItem.product.name}
                            </li>
                          ))}
                        {relatedBundle.products.length > 3 && (
                          <li className="text-purple-600 text-xs mt-1">
                            + {relatedBundle.products.length - 3} more products
                          </li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
