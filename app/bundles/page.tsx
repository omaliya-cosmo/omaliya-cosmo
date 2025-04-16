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
      result = result.filter(bundle => bundle.category === categoryFilter);
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
        result = result.filter(b => b.featured).concat(result.filter(b => !b.featured));
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
      // In a real app, you would fetch from API
      // const response = await axios.get("/api/bundleoffers");
      // setBundles(response.data);
      
      // For now, using mock data
      const mockBundles: Bundle[] = [
        {
          id: "bundle-1",
          name: "Complete Skincare Routine",
          description: "A complete daily skincare routine with cleanser, toner, serum, and moisturizer",
          products: [
            { id: "p1", name: "Gentle Facial Cleanser", price: 24.99 },
            { id: "p2", name: "Vitamin C Serum", price: 49.99 },
            { id: "p3", name: "Hydrating Toner", price: 19.99 },
            { id: "p4", name: "Daily Moisturizer SPF 30", price: 29.99 }
          ],
          originalPrice: 124.96,
          bundlePrice: 99.99,
          savings: 24.97,
          savingsPercentage: 20,
          image: "/placeholder-bundle-skincare.jpg",
          category: "skincare",
          featured: true,
          tags: ["bestseller", "complete routine"]
        },
        {
          id: "bundle-2",
          name: "Anti-Aging Collection",
          description: "Target fine lines and wrinkles with this comprehensive anti-aging bundle",
          products: [
            { id: "p5", name: "Retinol Night Cream", price: 59.99 },
            { id: "p6", name: "Eye Contour Serum", price: 42.99 },
            { id: "p7", name: "Hyaluronic Acid Serum", price: 34.99 }
          ],
          originalPrice: 137.97,
          bundlePrice: 109.99,
          savings: 27.98,
          savingsPercentage: 20,
          image: "/placeholder-bundle-antiaging.jpg",
          category: "anti-aging",
          featured: true
        },
        {
          id: "bundle-3",
          name: "Body Care Essentials",
          description: "Complete body care routine for silky smooth skin from head to toe",
          products: [
            { id: "p8", name: "Body Scrub Coffee", price: 18.99 },
            { id: "p9", name: "Body Butter Shea", price: 22.99 },
            { id: "p10", name: "Hand Cream", price: 12.99 }
          ],
          originalPrice: 54.97,
          bundlePrice: 44.99,
          savings: 9.98,
          savingsPercentage: 18,
          image: "/placeholder-bundle-body.jpg",
          category: "body"
        },
        {
          id: "bundle-4",
          name: "Hair Care System",
          description: "Complete hair care system for healthy, shiny hair",
          products: [
            { id: "p11", name: "Strengthening Shampoo", price: 24.99 },
            { id: "p12", name: "Hydrating Conditioner", price: 24.99 },
            { id: "p13", name: "Hair Oil Treatment", price: 29.99 }
          ],
          originalPrice: 79.97,
          bundlePrice: 64.99,
          savings: 14.98,
          savingsPercentage: 19,
          image: "/placeholder-bundle-hair.jpg",
          category: "hair"
        },
        {
          id: "bundle-5",
          name: "Men's Grooming Kit",
          description: "Essential grooming products for the modern man",
          products: [
            { id: "p14", name: "Facial Cleanser for Men", price: 19.99 },
            { id: "p15", name: "Beard Oil", price: 17.99 },
            { id: "p16", name: "Moisturizer for Men", price: 22.99 }
          ],
          originalPrice: 60.97,
          bundlePrice: 49.99,
          savings: 10.98,
          savingsPercentage: 18,
          image: "/placeholder-bundle-men.jpg",
          category: "men"
        },
        {
          id: "bundle-6",
          name: "Travel Essentials",
          description: "Travel-sized skincare essentials for on-the-go",
          products: [
            { id: "p17", name: "Travel Cleanser", price: 12.99 },
            { id: "p18", name: "Travel Moisturizer", price: 14.99 },
            { id: "p19", name: "Travel Sunscreen", price: 9.99 },
            { id: "p20", name: "Travel Lip Balm", price: 5.99 }
          ],
          originalPrice: 43.96,
          bundlePrice: 34.99,
          savings: 8.97,
          savingsPercentage: 20,
          image: "/placeholder-bundle-travel.jpg",
          category: "travel",
          featured: true
        }
      ];

      // Extract unique categories
      const uniqueCategories = Array.from(new Set(mockBundles.map(bundle => bundle.category)));
      setCategories(uniqueCategories);
      
      setBundles(mockBundles);
      setFilteredBundles(mockBundles);
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
      for (const product of bundle.products) {
        await axios.post("/api/cart", {
          productId: product.id,
          quantity: 1,
          bundleId: bundle.id // Add bundleId to identify that these are part of a bundle
        });
      }

      setCartCount(prev => prev + bundle.products.length);
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
                <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">Bundle & Save</h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8">
                  Shop our carefully curated product bundles designed to work perfectly together — at special discounted prices.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2 shadow-md hover:shadow-lg transform transition-all hover:translate-y-[-2px]">
                    <Sparkles size={18} className="animate-pulse" />
                    Featured Bundles
                  </Button>
                  <Button size="lg" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 gap-2">
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
            <h2 className="text-2xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-700">Discover Our Bundles</h2>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 relative">
                <div className="absolute left-2 pointer-events-none">
                  <Filter className="h-4 w-4 text-purple-500" />
                </div>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px] pl-8 border-gray-200 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Select
                value={sortOption}
                onValueChange={setSortOption}
              >
                <SelectTrigger className="w-full sm:w-[180px] border-gray-200 focus:border-purple-400 focus:ring focus:ring-purple-200 focus:ring-opacity-50">
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
              {[1, 2, 3, 4, 5, 6].map(i => (
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
              <h3 className="text-xl font-medium mb-2">Oops! Something went wrong</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => fetchBundles()}>Try Again</Button>
            </div>
          ) : filteredBundles.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No bundles found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find any bundles matching your filters. Try adjusting your criteria.
              </p>
              <Button onClick={() => {
                setCategoryFilter("all");
                setSortOption("featured");
              }}>Reset Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBundles.map(bundle => (
                <motion.div
                  key={bundle.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -5 }}
                  className="h-full"
                >
                  <Card className="h-full flex flex-col overflow-hidden border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300">
                    <div className="relative overflow-hidden" style={{ height: '240px' }}>
                      {bundle.image ? (
                        <div 
                          className="h-full bg-cover bg-center transform transition-transform duration-700 hover:scale-110" 
                          style={{ 
                            backgroundImage: `url('${bundle.image}')`,
                            backgroundColor: 'rgba(0,0,0,0.05)'
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
                          <Link href={`/bundles/${bundle.id}`} className="hover:text-purple-600 bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                            {bundle.name}
                          </Link>
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {bundle.description}
                        </p>
                      </div>
                      
                      <Separator className="my-4 bg-gradient-to-r from-transparent via-purple-200 to-transparent h-px" />
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-800">Includes:</p>
                        <ul className="text-sm space-y-2">
                          {bundle.products.slice(0, 3).map((product, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-gray-700">
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
            style={{ top: '40%', right: '5%' }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 18,
              ease: "easeInOut"
            }}
          />

          <motion.div 
            className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-pink-200/20 to-purple-200/20 blur-3xl"
            style={{ bottom: '10%', left: '5%' }}
            animate={{
              y: [0, 30, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 15,
              ease: "easeInOut"
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
                Save money and simplify your beauty routine with our expertly curated product combinations
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
                <h3 className="text-xl font-bold mb-3 text-gray-800">Save More</h3>
                <p className="text-gray-600">
                  Enjoy exclusive discounts up to 25% when you buy our carefully curated product bundles.
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
                <h3 className="text-xl font-bold mb-3 text-gray-800">Perfect Combinations</h3>
                <p className="text-gray-600">
                  Products that work together for maximum effectiveness and results for your beauty routine.
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
                <h3 className="text-xl font-bold mb-3 text-gray-800">Simplified Routine</h3>
                <p className="text-gray-600">
                  Get everything you need in one purchase with our expertly designed skincare and beauty bundles.
                </p>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2 shadow-md hover:shadow-lg transform transition-all hover:translate-y-[-2px]"
              >
                <Sparkles size={18} />
                Explore All Bundles
              </Button>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}