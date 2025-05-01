"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useCountry } from "@/app/lib/hooks/useCountry";
import { motion } from "framer-motion";
import { Package, Sparkles, Tag, ShoppingCart } from "lucide-react";
import Link from "next/link";

// Imported Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "../lib/hooks/CartContext";
import {
  BundleOffer as PrismaBundleOffer,
  ProductsOnBundles as PrismaProductsOnBundles,
  Product,
} from "@prisma/client";

interface ProductsOnBundles extends PrismaProductsOnBundles {
  product: Product;
}

interface BundleOffer extends PrismaBundleOffer {
  products: ProductsOnBundles[];
}

export default function BundlesPage() {
  const { country } = useCountry();
  const [bundles, setBundles] = useState<BundleOffer[]>([]);
  const [filteredBundles, setFilteredBundles] = useState<BundleOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>("featured");
  const [featuredBundles, setFeaturedBundles] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    fetchBundles();
  }, []);

  const { refreshCart } = useCart();

  // Calculate savings percentage
  const getSavingsPercentage = (originalPrice: number, offerPrice: number) => {
    return Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
  };

  useEffect(() => {
    // Apply sorting
    if (bundles.length === 0) return;

    let result = [...bundles];

    switch (sortOption) {
      case "price-low":
        result.sort((a, b) => {
          const priceA = country === "LK" ? a.offerPriceLKR : a.offerPriceUSD;
          const priceB = country === "LK" ? b.offerPriceLKR : b.offerPriceUSD;
          return priceA - priceB;
        });
        break;
      case "price-high":
        result.sort((a, b) => {
          const priceA = country === "LK" ? a.offerPriceLKR : a.offerPriceUSD;
          const priceB = country === "LK" ? b.offerPriceLKR : b.offerPriceUSD;
          return priceB - priceA;
        });
        break;
      case "savings":
        result.sort((a, b) => {
          const savingsA = getSavingsPercentage(
            country === "LK" ? a.originalPriceLKR : a.originalPriceUSD,
            country === "LK" ? a.offerPriceLKR : a.offerPriceUSD
          );
          const savingsB = getSavingsPercentage(
            country === "LK" ? b.originalPriceLKR : b.originalPriceUSD,
            country === "LK" ? b.offerPriceLKR : b.offerPriceUSD
          );
          return savingsB - savingsA;
        });
        break;
      case "featured":
      default:
        result = result
          .filter((b) => featuredBundles.has(b.id))
          .concat(result.filter((b) => !featuredBundles.has(b.id)));
        break;
    }

    setFilteredBundles(result);
  }, [bundles, sortOption, country, featuredBundles]);

  const fetchBundles = async () => {
    try {
      // Fetch from actual API
      const response = await axios.get("/api/bundleoffers");
      const bundleOffers: BundleOffer[] = response.data;

      // Identify featured bundles (those with highest savings %)
      const featured = new Set<string>();

      // Sort bundles by savings percentage and mark top 3 as featured
      const bundlesBySavings = [...bundleOffers].sort((a, b) => {
        // Use the appropriate pricing based on country for consistent behavior
        const savingsA = getSavingsPercentage(
          a.originalPriceLKR,
          a.offerPriceLKR
        );
        const savingsB = getSavingsPercentage(
          b.originalPriceLKR,
          b.offerPriceLKR
        );
        return savingsB - savingsA;
      });

      // Mark top bundles as featured
      bundlesBySavings
        .slice(0, Math.min(3, bundlesBySavings.length))
        .forEach((bundle) => featured.add(bundle.id));

      setFeaturedBundles(featured);
      setBundles(bundleOffers);
      setFilteredBundles(bundleOffers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bundles:", error);
      setError("Failed to load bundle offers. Please try again later.");
      setLoading(false);
    }
  };

  const addBundleToCart = async (bundle: BundleOffer) => {
    try {
      await axios.post("/api/cart", {
        productId: bundle.id,
        quantity: 1,
        isBundle: true,
      });

      await refreshCart(); // Refresh the cart context

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

  return (
    <div className="min-h-screen flex flex-col">
      <ToastContainer />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 md:py-20 overflow-hidden relative">
          {/* Animated background elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.5, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-purple-200 rounded-full opacity-50 blur-3xl"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.5, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-pink-200 rounded-full opacity-50 blur-3xl"
          ></motion.div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  Bundle & Save
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8">
                  Shop our carefully curated product bundles designed to work
                  perfectly together — at special discounted prices.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="container mx-auto px-12 md:px-24 py-8">
          {/* Sorting controls */}
          <div className="flex justify-end mb-6">
            <div className="w-64">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort bundles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="savings">Best Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bundles Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-6 w-2/3 bg-muted animate-pulse mb-2" />
                    <div className="h-4 w-full bg-muted animate-pulse mb-2" />
                    <div className="h-4 w-3/4 bg-muted animate-pulse mb-4" />
                    <div className="flex justify-between items-center">
                      <div className="h-6 w-1/3 bg-muted animate-pulse" />
                      <div className="h-9 w-1/4 bg-muted animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => fetchBundles()}>Try Again</Button>
            </div>
          ) : filteredBundles.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No bundles found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find any bundles matching your filters. Try
                adjusting your criteria.
              </p>
              <Button
                onClick={() => {
                  setSortOption("featured");
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBundles.map((bundle) => {
                // Use country to determine which price to use
                const originalPrice =
                  country === "LK"
                    ? bundle.originalPriceLKR
                    : bundle.originalPriceUSD;
                const offerPrice =
                  country === "LK"
                    ? bundle.offerPriceLKR
                    : bundle.offerPriceUSD;
                const savingsPercentage = getSavingsPercentage(
                  originalPrice,
                  offerPrice
                );
                const isFeatured = featuredBundles.has(bundle.id);
                const currencySymbol = country === "LK" ? "Rs." : "$";

                return (
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

                        {isFeatured && (
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none shadow-md">
                              Featured
                            </Badge>
                          </div>
                        )}

                        <div className="absolute top-4 right-4">
                          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-none font-medium shadow-md">
                            Save {savingsPercentage}%
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
                            Collection of {bundle.products.length} products at a
                            special price
                          </p>
                        </div>

                        <Separator className="my-4 bg-gradient-to-r from-transparent via-purple-200 to-transparent h-px" />

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-800">
                            Includes:
                          </p>
                          <ul className="text-sm space-y-2">
                            {bundle.products.slice(0, 3).map((item) => (
                              <li
                                key={item.id}
                                className="flex items-center gap-2 text-gray-700"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                                {item.product.name}
                              </li>
                            ))}
                            {bundle.products.length > 3 && (
                              <li className="text-sm text-purple-600 font-medium pl-3.5 hover:text-pink-600 transition-colors cursor-pointer">
                                + {bundle.products.length - 3} more items
                              </li>
                            )}
                          </ul>
                        </div>
                      </CardContent>

                      <CardFooter className="p-6 border-t bg-gradient-to-r from-purple-50 to-pink-50">
                        <div className="w-full flex justify-between items-center">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500 line-through">
                              {currencySymbol}
                              {originalPrice.toFixed(2)}
                            </p>
                            <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-pink-700">
                              {currencySymbol}
                              {offerPrice.toFixed(2)}
                            </p>
                          </div>

                          <Button
                            onClick={() => addBundleToCart(bundle)}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2 shadow-md hover:shadow-lg transform transition-all"
                            disabled={bundle.stock <= 0}
                          >
                            <ShoppingCart className="h-4 w-4" />
                            {bundle.stock > 0 ? "Add Bundle" : "Out of Stock"}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Why Choose Bundles */}
        <div className="bg-gradient-to-b from-white to-purple-50 py-16 relative overflow-hidden">
          {/* Decorative elements */}
          <motion.div
            className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-purple-200/20 to-pink-200/20 blur-3xl"
            style={{ top: "40%", right: "5%" }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              repeat: Infinity,
              duration: 18,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-pink-200/20 to-purple-200/20 blur-3xl"
            style={{ bottom: "10%", left: "5%" }}
            animate={{
              y: [0, 30, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              repeat: Infinity,
              duration: 15,
              ease: "easeInOut",
            }}
          />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4 shadow-sm">
                Bundle Benefits
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-pink-700">
                Why Choose Our Product Bundles?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Save money and simplify your beauty routine with our expertly
                curated product combinations
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-md">
                  <Tag className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  Save More
                </h3>
                <p className="text-gray-600">
                  Enjoy exclusive discounts up to 25% when you buy our carefully
                  curated product bundles.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-md">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  Perfect Combinations
                </h3>
                <p className="text-gray-600">
                  Products that work together for maximum effectiveness and
                  results for your beauty routine.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-md">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  Simplified Routine
                </h3>
                <p className="text-gray-600">
                  Get everything you need in one purchase with our expertly
                  designed skincare and beauty bundles.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
