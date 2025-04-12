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
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchAdmin = async () => {
      const userData = await getCustomerFromToken();
      setUserData(userData);
    };
    fetchAdmin();
    fetchCartData();
    fetchBundles();
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
      setCategories(uniqueCategories);

      setBundles(transformedBundles);
      setFilteredBundles(transformedBundles);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bundles:", error);
      setError("Failed to load bundle offers. Please try again later.");
      setLoading(false);
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

      <Header userData={userData} cartCount={cartCount} />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  Bundle & Save
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8">
                  Shop our carefully curated product bundles designed to work
                  perfectly together — at special discounted prices.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button size="lg" className="gap-2">
                    <Sparkles size={18} />
                    Featured Bundles
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2">
                    <Tag size={18} />
                    View All Offers
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-2xl font-semibold">Product Bundles</h2>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="savings">Highest Savings</SelectItem>
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <div
                      className="relative overflow-hidden"
                      style={{ height: "240px" }}
                    >
                      {bundle.image ? (
                        <div
                          className="h-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url('${bundle.image}')`,
                            backgroundColor: "rgba(0,0,0,0.05)",
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center bg-muted">
                          <Package className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}

                      {bundle.featured && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-primary text-primary-foreground">
                            Featured
                          </Badge>
                        </div>
                      )}

                      <div className="absolute top-4 right-4">
                        <Badge className="bg-red-500 text-white">
                          Save {bundle.savingsPercentage}%
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-5 flex-grow">
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold mb-2">
                          <Link
                            href={`/bundles/${bundle.id}`}
                            className="hover:text-purple-600 transition-colors"
                          >
                            {bundle.name}
                          </Link>
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {bundle.description}
                        </p>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Includes:</p>
                        <ul className="text-sm space-y-1">
                          {bundle.products.slice(0, 3).map((product, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-primary" />
                              {product.name}
                            </li>
                          ))}
                          {bundle.products.length > 3 && (
                            <li className="text-sm text-muted-foreground">
                              + {bundle.products.length - 3} more items
                            </li>
                          )}
                        </ul>
                      </div>
                    </CardContent>

                    <CardFooter className="p-5 border-t bg-muted/30">
                      <div className="w-full flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground line-through">
                            ${bundle.originalPrice.toFixed(2)}
                          </p>
                          <p className="text-lg font-bold text-primary">
                            ${bundle.bundlePrice.toFixed(2)}
                          </p>
                        </div>

                        <Button
                          onClick={() => addBundleToCart(bundle)}
                          className="gap-2"
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
        <div className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Why Choose Our Product Bundles?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-background p-6 rounded-lg text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Tag className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Save More</h3>
                <p className="text-muted-foreground text-sm">
                  Enjoy exclusive discounts when you buy our carefully curated
                  product bundles.
                </p>
              </div>

              <div className="bg-background p-6 rounded-lg text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Perfect Combinations
                </h3>
                <p className="text-muted-foreground text-sm">
                  Products that work together for maximum effectiveness and
                  results.
                </p>
              </div>

              <div className="bg-background p-6 rounded-lg text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Simplified Routine</h3>
                <p className="text-muted-foreground text-sm">
                  Get everything you need in one purchase with our expertly
                  designed bundles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
