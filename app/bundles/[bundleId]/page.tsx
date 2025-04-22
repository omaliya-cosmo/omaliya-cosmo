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
import NewsletterSection from "@/components/home/Newsletter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BundleAddToCartButton from "@/components/bundle-detail/BundleAddToCartButton";
import { getCustomerFromToken } from "@/app/actions";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BundleOffer as PrismaBundleOffer, Product } from "@prisma/client";

interface BundleOffer extends PrismaBundleOffer {
  products: Product[];
}

// Types for bundles
interface BundleProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  products: BundleProduct[];
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  savingsPercentage: number;
  image?: string;
  category: string;
  featured?: boolean;
  tags?: string[];
  longDescription?: string;
  benefits?: string[];
  howToUse?: string;
  // Additional props needed for BundleAddToCartButton compatibility
  stock: number;
  priceLKR: number;
  priceUSD: number;
  discountPriceLKR: number | null;
  discountPriceUSD: number | null;
}

export default function BundleDetailPage() {
  const { bundleId } = useParams();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Add state for Header props
  const [bundleoffers, setBundleoffers] = useState([]);

  useEffect(() => {
    // Fetch header data
    async function fetchHeaderData() {
      try {
        // Fetch bundle offers for Header
        const bundlesResponse = await axios.get("/api/bundleoffers");
        console.log("bundlesResponse", bundlesResponse.data);
        setBundleoffers(bundlesResponse.data);
      } catch (err) {
        console.error("Error fetching header data:", err);
        setError(err.message || "Error fetching data");
      }
    }

    fetchHeaderData();

    async function fetchBundle() {
      try {
        setLoading(true);
        // Fetch bundle data from the API
        const response = await axios.get(`/api/bundleoffers`);

        // Find the specific bundle by ID
        const bundleData = response.data.find(
          (bundle: any) => bundle.id === bundleId
        );

        if (bundleData) {
          // Transform API data to match our Bundle interface
          const transformedBundle: Bundle = {
            id: bundleData.id,
            name: bundleData.bundleName,
            description:
              bundleData.description ||
              "A curated collection of our best products at a special price",
            products: bundleData.products.map((item: any) => ({
              id: item.product.id,
              name: item.product.name,
              price: item.product.priceLKR,
              description: item.product.description,
              image: item.product.imageUrls?.[0],
            })),
            originalPrice: bundleData.originalPriceLKR,
            bundlePrice: bundleData.offerPriceLKR,
            savings: bundleData.originalPriceLKR - bundleData.offerPriceLKR,
            savingsPercentage: Math.round(
              ((bundleData.originalPriceLKR - bundleData.offerPriceLKR) /
                bundleData.originalPriceLKR) *
                100
            ),
            image: bundleData.imageUrl,
            category:
              bundleData.products[0]?.product.category?.name || "beauty",
            featured: bundleData.featured || false,
            tags: bundleData.tags || ["bundle offer"],
            longDescription:
              bundleData.longDescription ||
              "Experience the ultimate in beauty care with this specially curated bundle. Each product is selected to complement the others, providing you with a complete solution for your beauty needs.",
            benefits: bundleData.benefits || [
              "Save money with our bundle pricing",
              "Products selected to work together for better results",
              "Perfect for gifting or treating yourself",
            ],
            howToUse:
              bundleData.howToUse ||
              "For best results, use each product as directed on its individual packaging.",
            // BundleAddToCartButton compatibility properties
            stock: 100, // Assuming bundles are always in stock with a high quantity
            priceLKR: bundleData.offerPriceLKR,
            priceUSD: bundleData.offerPriceUSD,
            discountPriceLKR: bundleData.offerPriceLKR,
            discountPriceUSD: bundleData.offerPriceUSD,
          };

          setBundle(transformedBundle);
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

    fetchBundle();
  }, [bundleId]);

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

        <div className="container mx-auto px-24 relative z-10">
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
                <span className="font-medium">{bundle.name}</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </div>
      </section>

      <div className="container mx-auto px-24 py-8 -mt-6">
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
              {bundle.image ? (
                <Image
                  src={bundle.image}
                  alt={bundle.name}
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

            {/* Featured badge */}
            {bundle.featured && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold z-10 shadow-md">
                Featured
              </div>
            )}

            {/* Savings badge */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold z-10 shadow-md">
              Save {bundle.savingsPercentage}%
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
                {bundle.category.charAt(0).toUpperCase() +
                  bundle.category.slice(1)}
              </Badge>

              {bundle.tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Bundle name and rating */}
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-pink-700">
                {bundle.name}
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
            <p className="text-gray-600 mb-6">{bundle.description}</p>

            {/* Pricing section */}
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100/50 shadow-sm">
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700">
                  ${bundle.bundlePrice.toFixed(2)}
                </span>
                <span className="ml-2 text-lg line-through text-gray-500">
                  ${bundle.originalPrice.toFixed(2)}
                </span>
                <span className="ml-2 text-sm text-green-600 font-medium">
                  You save: ${bundle.savings.toFixed(2)} (
                  {bundle.savingsPercentage}%)
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
                {bundle.products.map((product) => (
                  <li key={product.id} className="flex justify-between py-2">
                    <span className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="text-gray-800">{product.name}</span>
                    </span>
                    <span className="text-gray-600 font-medium">
                      ${product.price.toFixed(2)}
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
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-16 text-center py-1 focus:outline-none"
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
                currency="LKR"
              />
            </div>
          </motion.div>
        </div>

        {/* Products in this bundle */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Products in This Bundle</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bundle.products.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="aspect-square relative bg-gray-100">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      variant="secondary"
                      className="bg-white text-pink-600 hover:bg-pink-50"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-1 text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                    {product.description || "No description available."}
                  </p>
                  <p className="font-bold text-pink-600">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* You may also like section */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-pink-700">
              You May Also Like
            </h2>
            <Button
              variant="link"
              className="text-purple-600 hover:text-pink-600 transition-colors"
            >
              View All Bundles
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {bundleoffers.slice(0, 3).map((bundle: BundleOffer) => (
              <motion.div
                key={bundle.id}
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
                    {bundle.imageUrl ? (
                      <div
                        className="h-full bg-cover bg-center transform transition-transform duration-700 hover:scale-110"
                        style={{
                          backgroundImage: `url('${bundle.imageUrl}')`,
                          backgroundColor: "rgba(0,0,0,0.05)",
                        }}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                        <Package className="h-16 w-16 text-purple-300" />
                      </div>
                    )}

                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none shadow-md">
                        Featured
                      </Badge>
                    </div>

                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-none font-medium shadow-md">
                        Save 12%
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6 flex-grow">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold mb-3 transition-colors">
                        <Link
                          href={`/bundles/${bundle.id}`}
                          className="hover:text-purple-600 bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                        >
                          {bundle.bundleName}
                        </Link>
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {`Collection of ${bundle.products.length} products at a special price`}
                      </p>
                    </div>

                    <Separator className="my-4 bg-gradient-to-r from-transparent via-purple-200 to-transparent h-px" />

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-800">
                        Includes:
                      </p>
                      <ul className="text-sm space-y-2">
                        {bundle.products.map((product, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-gray-700"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                            {product.product.name}
                          </li>
                        ))}
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
