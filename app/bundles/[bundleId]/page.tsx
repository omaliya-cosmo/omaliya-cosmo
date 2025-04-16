"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Package, ShoppingCart, Share2, CheckCircle, Star, Heart, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

// Import components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import NewsletterSection from "@/components/home/Newsletter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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
}

export default function BundleDetailPage() {
  const { bundleId } = useParams();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    async function fetchBundle() {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // const response = await axios.get(`/api/bundleoffers/${bundleId}`);
        
        // For now, using mock data
        const mockBundles: Bundle[] = [
          {
            id: "bundle-1",
            name: "Complete Skincare Routine",
            description: "A complete daily skincare routine with cleanser, toner, serum, and moisturizer",
            longDescription: "Transform your skincare routine with our complete set designed to cleanse, hydrate, and protect your skin. This carefully curated bundle includes our bestselling products that work synergistically to reveal your best skin yet. Perfect for all skin types and especially beneficial for those looking to establish a consistent skincare regimen.",
            products: [
              { id: "p1", name: "Gentle Facial Cleanser", price: 24.99, description: "A gentle foaming cleanser that removes impurities without stripping the skin's natural oils." },
              { id: "p2", name: "Vitamin C Serum", price: 49.99, description: "Brightening serum that helps fade dark spots and improve overall skin tone." },
              { id: "p3", name: "Hydrating Toner", price: 19.99, description: "Alcohol-free toner that balances pH levels and prepares skin for better product absorption." },
              { id: "p4", name: "Daily Moisturizer SPF 30", price: 29.99, description: "Lightweight daily moisturizer with broad-spectrum SPF 30 protection." }
            ],
            originalPrice: 124.96,
            bundlePrice: 99.99,
            savings: 24.97,
            savingsPercentage: 20,
            image: "/placeholder-bundle-skincare.jpg",
            category: "skincare",
            featured: true,
            tags: ["bestseller", "complete routine"],
            benefits: [
              "Complete AM & PM skincare routine in one set",
              "Products designed to work together for maximum efficacy",
              "Helps improve skin texture, tone, and hydration",
              "Suitable for all skin types including sensitive skin"
            ],
            howToUse: "Morning routine: Begin with the Gentle Facial Cleanser, followed by Hydrating Toner, Vitamin C Serum, and finish with Daily Moisturizer SPF 30. Evening routine: Follow the same steps but substitute the SPF moisturizer with your night cream (not included)."
          },
          // ...existing mock bundles...
        ];
        
        const bundleData = mockBundles.find(b => b.id === bundleId);
        
        if (bundleData) {
          setBundle(bundleData);
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

  const addBundleToCart = async () => {
    if (!bundle) return;

    try {
      // In a real app, you would have an API endpoint to handle bundle additions
      for (const product of bundle.products) {
        await axios.post("/api/cart", {
          productId: product.id,
          quantity: quantity,
          bundleId: bundle.id
        });
      }

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
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <main className="bg-white">
      <Header userData={null} cartCount={0} />
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
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-6">
            <BreadcrumbItem>
              <BreadcrumbLink href="/"><span className="hover:text-purple-600 transition-colors">Home</span></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/bundles"><span className="hover:text-purple-600 transition-colors">Bundles</span></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink isActive><span className="font-medium">{bundle.name}</span></BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          
          <div className="flex justify-between items-center mb-8">
            <Link href="/bundles" className="inline-flex items-center text-purple-600 hover:text-pink-600 transition-colors font-medium text-sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Bundles
            </Link>
            
            <Button
              variant="ghost"
              className="text-purple-600 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-1.5"
              onClick={() => {
                // In a real app, implement wishlist functionality
                toast.success("Added to wishlist!", {
                  position: "bottom-right",
                  autoClose: 2000,
                });
              }}
            >
              <Heart className="h-4 w-4" />
              Save for Later
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 -mt-6">
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
                <div className="w-full h-full flex items-center justify-center" onLoad={() => setImageLoaded(true)}>
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
            
            {/* Bundle details overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
                Click to explore bundle
              </div>
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
                {bundle.category.charAt(0).toUpperCase() + bundle.category.slice(1)}
              </Badge>
              
              {bundle.tags?.map(tag => (
                <Badge key={tag} variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                  {tag}
                </Badge>
              ))}
            </div>
            
            {/* Bundle name and rating */}
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-pink-700">{bundle.name}</h1>
              <div className="flex items-center mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < 4 ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">4.0 (12 reviews)</span>
              </div>
            </div>
            
            {/* Bundle description */}
            <p className="text-gray-600 mb-6">{bundle.description}</p>
            
            {/* Pricing section */}
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100/50 shadow-sm">
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700">${bundle.bundlePrice.toFixed(2)}</span>
                <span className="ml-2 text-lg line-through text-gray-500">${bundle.originalPrice.toFixed(2)}</span>
                <span className="ml-2 text-sm text-green-600 font-medium">
                  You save: ${bundle.savings.toFixed(2)} ({bundle.savingsPercentage}%)
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Price includes all applicable taxes</p>
            </div>
            
            {/* Bundle contents */}
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-3">Bundle Contains:</h3>
              <ul className="space-y-2 divide-y divide-gray-100">
                {bundle.products.map((product) => (
                  <li key={product.id} className="flex justify-between py-2">
                    <span className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="text-gray-800">{product.name}</span>
                    </span>
                    <span className="text-gray-600 font-medium">${product.price.toFixed(2)}</span>
                  </li>
                ))}
                <li className="pt-2 text-sm text-gray-500">
                  Individual retail value: ${bundle.originalPrice.toFixed(2)}
                </li>
              </ul>
            </div>
            
            <div className="space-y-6">
              {/* Quantity selector */}
              <div className="flex items-center">
                <span className="text-gray-700 mr-4">Quantity:</span>
                <div className="flex border border-purple-200 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 border-r border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-16 text-center py-1 focus:outline-none focus:ring-1 focus:ring-purple-300"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 border-l border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={addBundleToCart} 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-2.5 rounded-md font-medium flex-1 sm:flex-none flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform transition-all hover:translate-y-[-2px]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add Bundle to Cart
                </Button>
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 px-4 py-2.5 rounded-md font-medium flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
              
              {/* Additional info */}
              <div className="text-sm text-gray-600 space-y-2">
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Free shipping on orders over $50
                </p>
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  30-day money back guarantee
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bundle details tabs */}
        <div className="mb-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b border-gray-200 mb-8">
              <TabsTrigger 
                value="description" 
                className="text-sm font-medium px-1 py-3 data-[state=active]:border-b-2 data-[state=active]:border-pink-600 data-[state=active]:text-pink-600"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="howToUse"
                className="text-sm font-medium px-1 py-3 ml-8 data-[state=active]:border-b-2 data-[state=active]:border-pink-600 data-[state=active]:text-pink-600"
              >
                How to Use
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className="text-sm font-medium px-1 py-3 ml-8 data-[state=active]:border-b-2 data-[state=active]:border-pink-600 data-[state=active]:text-pink-600"
              >
                Reviews
              </TabsTrigger>
            </TabsList>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <TabsContent value="description" className="mt-0">
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">About This Bundle</h2>
                    <p className="text-gray-700 mb-6">
                      {bundle.longDescription}
                    </p>
                    
                    <h3 className="text-lg font-bold mb-3">Key Benefits</h3>
                    <ul className="space-y-2 mb-6">
                      {bundle.benefits?.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 mr-2 text-pink-600 flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="howToUse" className="mt-0">
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">How To Use</h2>
                    <p className="text-gray-700 mb-6">
                      {bundle.howToUse || "No specific instructions provided for this bundle."}
                    </p>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-bold mb-3">Step-by-Step Guide</h3>
                      <ol className="list-decimal list-inside space-y-3 ml-4">
                        {bundle.products.map((product, index) => (
                          <li key={index} className="text-gray-700">
                            <span className="font-medium">{product.name}</span>: 
                            {product.description && <span className="ml-1">{product.description}</span>}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews" className="mt-0">
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
                    <div className="flex items-center mb-6">
                      <div className="flex mr-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-5 h-5 ${i < 4 ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <span className="text-lg font-semibold">4.0 out of 5</span>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Example review */}
                      <div className="border-b border-gray-200 pb-6">
                        <div className="flex items-center mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < 5 ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                            ))}
                          </div>
                          <span className="ml-2 text-sm font-medium">Excellent value!</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          I've been using this bundle for 2 weeks and already see a difference in my skin texture. Great value for the price.
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Sarah T. • March 15, 2025</span>
                          <span>Verified Purchase</span>
                        </div>
                      </div>
                      
                      {/* Another example review */}
                      <div className="border-b border-gray-200 pb-6">
                        <div className="flex items-center mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < 3 ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                            ))}
                          </div>
                          <span className="ml-2 text-sm font-medium">Good but not amazing</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          The products are good quality but I was expecting more dramatic results. The cleanser is excellent though.
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Michael P. • February 28, 2025</span>
                          <span>Verified Purchase</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
              
              {/* Bundle details sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-pink-50 p-6 rounded-lg sticky top-24">
                  <h3 className="text-lg font-bold mb-4">Bundle Details</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Category:</dt>
                      <dd className="font-medium">{bundle.category.charAt(0).toUpperCase() + bundle.category.slice(1)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Regular Price:</dt>
                      <dd className="font-medium">${bundle.originalPrice.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Bundle Price:</dt>
                      <dd className="font-medium text-pink-700">${bundle.bundlePrice.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">You Save:</dt>
                      <dd className="font-medium text-green-600">${bundle.savings.toFixed(2)} ({bundle.savingsPercentage}%)</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Items Included:</dt>
                      <dd className="font-medium">{bundle.products.length}</dd>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="font-medium mb-2">Share this bundle</h4>
                      <div className="flex space-x-3">
                        <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                          </svg>
                        </button>
                        <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"></path>
                          </svg>
                        </button>
                        <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </Tabs>
        </div>

        {/* Products in this bundle */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Products in This Bundle</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bundle.products.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
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
                    <Button variant="secondary" className="bg-white text-pink-600 hover:bg-pink-50">
                      View Details
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-1 text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description || "No description available."}</p>
                  <p className="font-bold text-pink-600">${product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* You may also like section */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-pink-700">You May Also Like</h2>
            <Button variant="link" className="text-purple-600 hover:text-pink-600 transition-colors">
              View All Bundles
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -5 }}
                className="border border-gray-100 rounded-lg overflow-hidden hover:border-purple-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-video relative bg-gradient-to-br from-purple-50 to-pink-50">
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-purple-300" />
                  </div>
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                    Save 15%
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-1 text-gray-900 hover:text-purple-700 transition-colors">Related Bundle {index + 1}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">Another great collection for your skincare needs with complementary products</p>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-500 line-through">$104.99</p>
                      <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700">$89.99</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      <NewsletterSection />
      <Footer />
    </main>
  );
}