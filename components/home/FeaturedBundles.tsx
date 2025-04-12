'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { toast } from 'react-toastify';

// Define types for bundle data - matching the bundles page
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
}

// Featured bundles data - using the same data as the bundles page
const FEATURED_BUNDLES: Bundle[] = [
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

const FeaturedBundles = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === FEATURED_BUNDLES.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? FEATURED_BUNDLES.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const addBundleToCart = async (bundle: Bundle) => {
    try {
      // In a real app, you would have an API endpoint to handle bundle additions
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
    <section className="py-16 bg-gradient-to-b from-purple-50 via-white to-white relative overflow-hidden">
      {/* Animated Background Elements - Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large blurred background gradient */}
        <motion.div 
          className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-r from-purple-100/40 to-pink-100/40 blur-3xl"
          style={{ top: '10%', left: '50%', x: '-50%' }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 15,
            ease: "easeInOut"
          }}
        />
        
        {/* Floating particles - various sizes and positions */}
        <motion.div
          className="absolute w-12 h-12 rounded-full bg-purple-200"
          style={{ top: '15%', left: '10%' }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute w-8 h-8 rounded-full bg-pink-200"
          style={{ top: '30%', right: '15%' }}
          animate={{
            y: [0, 25, 0],
            x: [0, -15, 0],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute w-16 h-16 rounded-full bg-purple-100"
          style={{ bottom: '20%', left: '20%' }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 12,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute w-10 h-10 rounded-full bg-pink-100"
          style={{ bottom: '30%', right: '25%' }}
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 9,
            ease: "easeInOut"
          }}
        />
        
        {/* Additional smaller particles */}
        <motion.div
          className="absolute w-6 h-6 rounded-full bg-purple-300"
          style={{ top: '55%', left: '8%' }}
          animate={{
            y: [0, 15, 0],
            x: [0, 8, 0],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 7,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute w-5 h-5 rounded-full bg-pink-300"
          style={{ top: '70%', right: '12%' }}
          animate={{
            y: [0, -12, 0],
            x: [0, -6, 0],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut"
          }}
        />
        
        {/* Gradient-filled particles with blur */}
        <motion.div
          className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-purple-200 to-pink-200 blur-sm"
          style={{ top: '40%', right: '5%' }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 blur-sm"
          style={{ bottom: '10%', left: '5%' }}
          animate={{
            scale: [1, 0.9, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Bundles</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our expertly crafted product bundles designed to work perfectly together — at special savings.
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
              animate={{ x: -currentIndex * 100 + '%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {FEATURED_BUNDLES.map((bundle) => (
                <div 
                  key={bundle.id} 
                  className="min-w-full w-full flex flex-col md:flex-row gap-8 px-4"
                >
                  {/* Bundle Image */}
                  <div className="w-full md:w-1/2 overflow-hidden rounded-xl">
                    <div className="relative aspect-[4/3] w-full">
                      {bundle.image ? (
                        <div 
                          className="h-full bg-cover bg-center" 
                          style={{ 
                            backgroundImage: `url('${bundle.image}')`,
                            backgroundColor: 'rgba(0,0,0,0.05)'
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center bg-muted">
                          <Package className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Save {bundle.savingsPercentage}%
                      </div>
                      {bundle.featured && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Bundle Details */}
                  <div className="w-full md:w-1/2 flex flex-col justify-center">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3">{bundle.name}</h3>
                    <p className="text-gray-600 mb-5">{bundle.description}</p>
                    
                    <div className="flex items-center mb-6">
                      <span className="text-3xl font-bold text-purple-800 mr-3">
                        ${bundle.bundlePrice.toFixed(2)}
                      </span>
                      <span className="text-xl line-through text-gray-500">
                        ${bundle.originalPrice.toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Included Products */}
                    <div className="mb-8">
                      <h4 className="font-medium mb-3">Includes:</h4>
                      <ul className="text-sm space-y-2">
                        {bundle.products.slice(0, 3).map((product, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-primary" />
                            {product.name} - ${product.price.toFixed(2)}
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
                      <Link 
                        href={`/bundles/${bundle.id}`} 
                        passHref
                      >
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
            {FEATURED_BUNDLES.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentIndex === index ? 'bg-purple-800' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* View All Bundles Button */}
        <div className="text-center mt-10">
          <Link href="/bundles">
            <Button variant="outline" className="border-purple-800 text-purple-800 hover:bg-purple-50">
              View All Bundles
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBundles;