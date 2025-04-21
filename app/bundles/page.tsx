"use client";

import { useState, useEffect } from "react";
import { getCustomerFromToken } from "../actions";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useCountry } from "@/app/lib/hooks/useCountry";
import { motion } from "framer-motion";
import { Package, Sparkles, Tag, ShoppingCart, Filter } from "lucide-react";
import Link from "next/link";

// Imported Components
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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

// Types for bundles
interface Product {
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
  products: Product[];
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  savingsPercentage: number;
  image?: string;
  category: string;
  featured?: boolean;
  tags?: string[];
}

// API response interfaces to match the Prisma schema
interface ApiProduct {
  id: string;
  name: string;
  description: string;
  priceLKR: number;
  priceUSD: number;
  imageUrls: string[];
}

interface ProductOnBundle {
  id: string;
  productId: string;
  bundleId: string;
  product: ApiProduct;
}

interface ApiBundleOffer {
  id: string;
  bundleName: string;
  originalPriceLKR: number;
  originalPriceUSD: number;
  offerPriceLKR: number;
  offerPriceUSD: number;
  endDate: string;
  imageUrl?: string;
  createdAt: string;
  products: ProductOnBundle[];
}

export default function BundlesPage() {
  const [userData, setUserData] = useState<any>(null);
  const { country } = useCountry();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [filteredBundles, setFilteredBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("featured");
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [bundleoffers, setBundleoffers] = useState<any[]>([]);
  const [bundleCategories, setBundleCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchAdmin = async () => {
      const userData = await getCustomerFromToken();
      setUserData(userData);
    };
    fetchAdmin();
    fetchCartData();
    fetchBundles();
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    // Apply filters and sorting
    let result = [...bundles];

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((bundle) => bundle.category === categoryFilter);
    }

    // Apply sorting
    switch (sortOption) {
      case "price-low":
        result.sort((a, b) => a.bundlePrice - b.bundlePrice);
        break;
      case "price-high":
        result.sort((a, b) => b.bundlePrice - a.bundlePrice);
        break;
      case "savings":
        result.sort((a, b) => b.savingsPercentage - a.savingsPercentage);
        break;
      case "featured":
      default:
        result = result
          .filter((b) => b.featured)
          .concat(result.filter((b) => !b.featured));
        break;
    }

    setFilteredBundles(result);
  }, [bundles, categoryFilter, sortOption]);

  const fetchCartData = async () => {
    try {
      const res = await axios.get("/api/cart");
      const data = res.data;
      const totalItems =
        data.items?.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        ) || 0;

      setCartCount(totalItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const fetchBundles = async () => {
    try {
      // Fetch from actual API
      const response = await axios.get("/api/bundleoffers");
      const apiBundles: ApiBundleOffer[] = response.data;

      // Set the bundleoffers for Header component
      setBundleoffers(apiBundles);

      // Transform API response to match our Bundle interface
      const transformedBundles: Bundle[] = apiBundles.map((bundle) => {
        // Calculate savings
        const originalPrice = bundle.originalPriceLKR; // Using LKR price by default
        const bundlePrice = bundle.offerPriceLKR;
        const savings = originalPrice - bundlePrice;
        const savingsPercentage = Math.round((savings / originalPrice) * 100);

        // Extract a category from products or use a default
        const productCategories = bundle.products.map((p) =>
          p.product.name.toLowerCase().includes("skin")
            ? "skincare"
            : p.product.name.toLowerCase().includes("hair")
            ? "hair"
            : p.product.name.toLowerCase().includes("body")
            ? "body"
            : p.product.name.toLowerCase().includes("travel")
            ? "travel"
            : "other"
        );

        const mostCommonCategory =
          productCategories.length > 0
            ? productCategories.reduce(
                (acc, curr) => {
                  if (acc.count[curr]) {
                    acc.count[curr]++;
                  } else {
                    acc.count[curr] = 1;
                  }
                  if (
                    !acc.maxCount ||
                    acc.count[curr] > acc.count[acc.maxCount]
                  ) {
                    acc.maxCount = curr;
                  }
                  return acc;
                },
                {
                  count: {} as Record<
                    "other" | "skincare" | "hair" | "body" | "travel",
                    number
                  >,
                  maxCount: null as
                    | "skincare"
                    | "hair"
                    | "body"
                    | "travel"
                    | "other"
                    | null,
                }
              ).maxCount || "other"
            : "other";

        return {
          id: bundle.id,
          name: bundle.bundleName,
          description: `Collection of ${bundle.products.length} products at a special price`,
          products: bundle.products.map((p) => ({
            id: p.product.id,
            name: p.product.name,
            price: p.product.priceLKR, // Using LKR price by default
            image:
              p.product.imageUrls && p.product.imageUrls.length > 0
                ? p.product.imageUrls[0]
                : undefined,
            description: p.product.description,
          })),
          originalPrice,
          bundlePrice,
          savings,
          savingsPercentage,
          image: bundle.imageUrl,
          category: mostCommonCategory,
          featured: false, // Set based on some criteria if available
          // Optionally add tags
          tags: [],
        };
      });

      // Check if any bundles should be featured (e.g., highest savings)
      if (transformedBundles.length > 0) {
        // Feature bundles with highest savings percentage
        transformedBundles
          .sort((a, b) => b.savingsPercentage - a.savingsPercentage)
          .slice(0, Math.min(3, transformedBundles.length))
          .forEach((bundle) => (bundle.featured = true));
      }

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(transformedBundles.map((bundle) => bundle.category))
      );
      setBundleCategories(uniqueCategories);

      setBundles(transformedBundles);
      setFilteredBundles(transformedBundles);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bundles:", error);
      setError("Failed to load bundle offers. Please try again later.");
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      // Fetch products (limit to a few for the header)
      const productsResponse = await axios.get("/api/products?limit=4");
      setProducts(productsResponse.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const addBundleToCart = async (bundle: Bundle) => {
    try {
      // In a real app, you would have an API endpoint to handle bundle additions
      // For now, we'll simply add each product individually
      await axios.post("/api/cart", {
        productId: bundle.id,
        quantity: 1,
        isBundle: true,
      });

      setCartCount((prev) => prev + 1);
      toast.success(`Added ${bundle.name} to your cart!`, {
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

      <Header
        userData={userData}
        cartCount={cartCount}
        products={products}
        categories={categories}
        bundles={bundleoffers}
        loading={loading}
        error={error}
      />

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
        <div className="container mx-auto px-24 py-8">
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
                  setCategoryFilter("all");
                  setSortOption("featured");
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBundles.map((bundle) => (
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
                      {bundle.image ? (
                        <div
                          className="h-full bg-cover bg-center transform transition-transform duration-700 hover:scale-110"
                          style={{
                            backgroundImage: `url('${bundle.image}')`,
                            backgroundColor: "rgba(0,0,0,0.05)",
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                          <Package className="h-16 w-16 text-purple-300" />
                        </div>
                      )}

                      {bundle.featured && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none shadow-md">
                            Featured
                          </Badge>
                        </div>
                      )}

                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-none font-medium shadow-md">
                          Save {bundle.savingsPercentage}%
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
                            {bundle.name}
                          </Link>
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {bundle.description}
                        </p>
                      </div>

                      <Separator className="my-4 bg-gradient-to-r from-transparent via-purple-200 to-transparent h-px" />

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-800">
                          Includes:
                        </p>
                        <ul className="text-sm space-y-2">
                          {bundle.products.slice(0, 3).map((product, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 text-gray-700"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                              {product.name}
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
                            ${bundle.originalPrice.toFixed(2)}
                          </p>
                          <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-pink-700">
                            ${bundle.bundlePrice.toFixed(2)}
                          </p>
                        </div>

                        <Button
                          onClick={() => addBundleToCart(bundle)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2 shadow-md hover:shadow-lg transform transition-all"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add Bundle
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
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

      <Footer />
    </div>
  );
}
