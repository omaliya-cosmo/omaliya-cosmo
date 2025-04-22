import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ProductCategory } from "@prisma/client";

export default function CategoriesSection() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        setCategories(response.data.categories);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Retry function for error recovery
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        setCategories(response.data.categories);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
        setLoading(false);
      }
    };
    fetchCategories();
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) => {
    if (searchQuery) {
      return (
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <section
      className="py-16 bg-gradient-to-b from-white to-purple-50 px-12"
      ref={ref}
      id="categories"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center relative"
        >
          {/* Decorative elements */}
          <div className="absolute -top-10 left-1/4 w-32 h-32 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -top-10 right-1/4 w-32 h-32 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-4 left-1/3 w-32 h-32 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

          <span className="inline-block bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4 shadow-sm">
            Explore Our Range
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight relative z-10">
            Shop By{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              Category
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto relative z-10">
            From everyday essentials to unique finds, explore a wide range of
            categories designed to meet all your shopping needs in one place.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                className="block w-full md:w-64 pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-300"
                placeholder="Search categories"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              )}
            </div>

            {/* View All Link */}
            <Link
              href="/products"
              className="hidden md:flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors group"
            >
              <span className="relative">
                View All
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </span>
              <svg
                className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </Link>
          </div>
        </motion.div>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 md:gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="rounded-xl overflow-hidden shadow-md bg-white"
              >
                <div className="relative aspect-square bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded animate-pulse mb-3 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl text-center mb-8 shadow-md"
          >
            <div className="inline-block p-3 bg-red-100 rounded-full mb-4">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <p className="text-lg font-bold mb-2">{error}</p>
            <p className="text-sm text-red-600 mb-6">
              We're having trouble loading the categories. Please try again.
            </p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              Retry
            </button>
          </motion.div>
        )}

        {!loading && !error && filteredCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-4"
          >
            <div className="bg-purple-100 inline-flex rounded-full p-5 mb-6">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No categories found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
              }}
              className="text-white bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
            >
              Clear search
            </button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!loading && !error && filteredCategories.length > 0 && (
            <motion.div
              key={searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 md:gap-6"
            >
              {filteredCategories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                  isHovered={hoverIndex === index}
                  onHover={() => setHoverIndex(index)}
                  onLeave={() => setHoverIndex(null)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile view all button */}
        <div className="mt-10 text-center md:hidden">
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <span>View All Categories</span>
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              ></path>
            </svg>
          </Link>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}

function CategoryCard({ category, index, isHovered, onHover, onLeave }: any) {
  // Individual card animation
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: index * 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      onHoverStart={onHover}
      onHoverEnd={onLeave}
      whileHover={{ y: -8 }}
    >
      <Link
        href={{
          pathname: "/products",
          query: {
            category: category.name.toLowerCase(),
          },
        }}
        className="group block overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 h-full bg-white"
        aria-label={`Browse ${category.name} products`}
      >
        <div className="relative aspect-square">
          {/* Fallback color while image loads */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100"></div>

          {/* Image with overlay */}
          <div className="absolute inset-0">
            <Image
              src={category.imageUrl || "/images/category-placeholder.jpg"}
              alt={category.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              loading={index < 3 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
          </div>

          {/* Category name, description, and product count */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform transition-all duration-500 z-10">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="font-bold text-lg md:text-xl leading-tight mb-1 group-hover:text-purple-200 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-white/90 line-clamp-2 group-hover:text-white transition-colors max-w-[90%]">
                  {category.description}
                </p>
              </div>
              {category.productCount && (
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {category.productCount} products
                </span>
              )}
            </div>

            {/* View button that appears on hover */}
            <div className="mt-4 transform opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
              <span className="inline-flex items-center text-sm font-medium text-white bg-purple-500/70 hover:bg-purple-600/90 backdrop-blur-sm rounded-lg px-4 py-2 transition-colors">
                Browse Products
                <svg
                  className="ml-1.5 w-4 h-4 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </span>
            </div>
          </div>

          {/* Animated glow effect on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
          ></div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden opacity-30 pointer-events-none">
            <div className="absolute -top-12 -right-12 w-24 h-24 border-l-2 border-b-2 border-white/30 rounded-full"></div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
