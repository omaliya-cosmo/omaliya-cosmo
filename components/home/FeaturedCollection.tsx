import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Types for better type safety
interface Price {
  usd: number;
  lkr: number;
}

interface Product {
  id: string;
  name: string;
  price: Price;
  image: string;
  slug: string;
  description?: string;
  rating?: number;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  products: Product[];
  discountPercentage?: number;
  totalSavings?: number;
}

export default function FeaturedCollection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  // Countdown timer for limited time offer
  useEffect(() => {
    const timer = setTimeout(() => {
      if (timeLeft.seconds > 0) {
        setTimeLeft({ ...timeLeft, seconds: timeLeft.seconds - 1 });
      } else if (timeLeft.minutes > 0) {
        setTimeLeft({ ...timeLeft, minutes: timeLeft.minutes - 1, seconds: 59 });
      } else if (timeLeft.hours > 0) {
        setTimeLeft({ ...timeLeft, hours: timeLeft.hours - 1, minutes: 59, seconds: 59 });
      } else if (timeLeft.days > 0) {
        setTimeLeft({ ...timeLeft, days: timeLeft.days - 1, hours: 23, minutes: 59, seconds: 59 });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  // This could come from an API in the future
  const featuredCollection: Collection = {
    id: 'glow-essentials',
    name: 'Glow Essentials',
    slug: 'collections/glow-essentials',
    description: 'Our bestselling collection for radiant, glowing skin. Perfect for all skin types.',
    heroImage: '/images/collections/glow-collection-hero.jpg',
    discountPercentage: 15,
    totalSavings: 16.99,
    products: [
      {
        id: 'p1',
        name: 'Vitamin C Serum',
        price: { usd: 29.99, lkr: 6000 },
        image: '/images/products/vitamin-c-serum.jpg',
        slug: 'vitamin-c-serum',
        description: 'Brightens and evens skin tone',
        rating: 4.9
      },
      {
        id: 'p2',
        name: 'Hyaluronic Acid Moisturizer',
        price: { usd: 34.99, lkr: 7000 },
        image: '/images/products/hyaluronic-moisturizer.jpg',
        slug: 'hyaluronic-acid-moisturizer',
        description: 'Deep hydration for plump skin',
        rating: 4.8
      },
      {
        id: 'p3',
        name: 'Brightening Eye Cream',
        price: { usd: 24.99, lkr: 5000 },
        image: '/images/products/eye-cream.jpg',
        slug: 'brightening-eye-cream',
        description: 'Reduces dark circles and puffiness',
        rating: 4.7
      },
      {
        id: 'p4',
        name: 'Exfoliating Toner',
        price: { usd: 21.99, lkr: 4400 },
        image: '/images/products/exfoliating-toner.jpg',
        slug: 'exfoliating-toner',
        description: 'Gentle exfoliation for smooth skin',
        rating: 4.8
      }
    ]
  };

  // Calculate total regular price
  const totalRegularPrice = featuredCollection.products.reduce(
    (sum, product) => sum + product.price.usd, 
    0
  );

  // Calculate discounted bundle price
  const bundlePrice = featuredCollection.discountPercentage 
    ? totalRegularPrice - (totalRegularPrice * (featuredCollection.discountPercentage / 100))
    : totalRegularPrice;

  return (
    <section className="py-16 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block bg-purple-100 text-purple-600 px-4 py-1 rounded-full text-sm font-medium mb-3">
            Special Collection
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Featured Collection
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our expertly curated collections designed to address specific skin concerns and enhance your beauty routine.
          </p>
        </motion.div>

        {/* Animated background elements */}
        <div className="relative min-h-[400px] mb-6 z-1">
          {/* Floating particles */}
          <motion.div 
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ zIndex: 0 }}
          >
            <motion.div
              className="absolute w-8 h-8 rounded-full bg-purple-200"
              style={{ top: '10%', left: '5%' }}
              animate={{
                y: [0, 30, 0],
                x: [0, 10, 0],
                opacity: [0.9, 0.6, 0.9],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 8,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute w-6 h-6 rounded-full bg-pink-200"
              style={{ top: '30%', right: '15%' }}
              animate={{
                y: [0, -20, 0],
                x: [0, -15, 0],
                opacity: [0.8, 0.5, 0.8],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 7,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-purple-300 to-pink-200"
              style={{ top: '15%', right: '25%' }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 0.9, 0.7],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 6,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute w-16 h-16 rounded-full bg-gradient-to-tr from-purple-200 to-pink-100"
              style={{ bottom: '25%', left: '30%' }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 0.8, 0.6],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 9,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>

        <motion.div 
          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ zIndex: 1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 md:p-8">
            {/* Collection info - takes full width on mobile, 1/3 on large screens */}
            <div className="lg:col-span-1">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center mb-3">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mr-3">
                      {featuredCollection.name}
                    </h3>
                    {featuredCollection.discountPercentage && (
                      <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-0.5 rounded-full animate-pulse">
                        SAVE {featuredCollection.discountPercentage}%
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {featuredCollection.description}
                  </p>
                  
                  {/* Reviews summary */}
                  <div className="flex items-center mb-6">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star}
                          className={`w-4 h-4 ${star <= 4.8 ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="ml-2 text-sm text-gray-600">4.8 • 230 reviews</p>
                  </div>
                  
                  {/* Limited time offer countdown */}
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Limited Time Offer Ends In:</p>
                    <div className="grid grid-cols-4 gap-1 text-center">
                      <div className="bg-purple-600 text-white rounded p-1">
                        <div className="text-xl font-bold">{timeLeft.days}</div>
                        <div className="text-xs">Days</div>
                      </div>
                      <div className="bg-purple-600 text-white rounded p-1">
                        <div className="text-xl font-bold">{timeLeft.hours}</div>
                        <div className="text-xs">Hrs</div>
                      </div>
                      <div className="bg-purple-600 text-white rounded p-1">
                        <div className="text-xl font-bold">{timeLeft.minutes}</div>
                        <div className="text-xs">Min</div>
                      </div>
                      <div className="bg-purple-600 text-white rounded p-1">
                        <div className="text-xl font-bold">{timeLeft.seconds}</div>
                        <div className="text-xs">Sec</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price comparison */}
                  {featuredCollection.discountPercentage && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Regular Price:</span>
                        <span className="text-sm text-gray-600 line-through">${totalRegularPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Bundle Price:</span>
                        <span className="text-lg font-bold text-purple-600">${bundlePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">You Save:</span>
                        <span className="text-sm font-medium text-green-600">${featuredCollection.totalSavings.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <Link 
                  href={`/${featuredCollection.slug}`}
                  className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-center font-medium"
                >
                  Shop Collection
                </Link>
              </div>
            </div>
            
            {/* Collection hero image */}
            <div className="lg:col-span-2 relative">
              <div className="aspect-w-16 aspect-h-9 md:aspect-h-7 rounded-xl overflow-hidden shadow-md">
                <Image
                  src={featuredCollection.heroImage || "/images/collection-placeholder.jpg"}
                  alt={featuredCollection.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 66vw"
                  className="object-cover"
                  priority
                />
                
                {/* Floating product cards */}
                <div className="absolute inset-0 flex items-end">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 w-full">
                    {featuredCollection.products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
                      >
                        <Link 
                          href={`/products/${product.slug}`}
                          className="block bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg hover:bg-white transition-colors transform hover:-translate-y-1 duration-200 h-full"
                        >
                          <div className="aspect-square relative rounded-md overflow-hidden mb-2">
                            <Image
                              src={product.image || "/images/product-placeholder.jpg"}
                              alt={product.name}
                              fill
                              sizes="(max-width: 768px) 50vw, 100px"
                              className="object-cover transition-transform duration-300 hover:scale-105"
                            />
                            {/* Optional hover info overlay */}
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                              <div className="text-white text-xs p-2 text-center">
                                <p>{product.description}</p>
                                <div className="mt-1 flex justify-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg 
                                      key={star}
                                      className={`w-3 h-3 ${star <= product.rating ? 'text-yellow-400' : 'text-gray-500'}`}
                                      fill="currentColor" 
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <h4 className="text-xs font-medium text-gray-800 line-clamp-1">
                            {product.name}
                          </h4>
                          <p className="text-xs text-purple-600 font-semibold">
                            ${product.price.usd.toFixed(2)}
                          </p>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Collection benefits */}
          <div className="bg-white/70 backdrop-blur-sm border-t border-purple-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-purple-100">
              <motion.div 
                className="p-4 text-center"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="flex items-center justify-center mb-2 text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600">Clinically proven results</p>
              </motion.div>
              <motion.div 
                className="p-4 text-center"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <div className="flex items-center justify-center mb-2 text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600">Top-rated products</p>
              </motion.div>
              <motion.div 
                className="p-4 text-center"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <div className="flex items-center justify-center mb-2 text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600">Save 15% on bundle</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}