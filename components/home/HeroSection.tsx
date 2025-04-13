import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const imageVariant = {
    hidden: { opacity: 0, scale: 0.8, rotate: 6 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 3,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const waveAnimation = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative bg-gradient-to-br from-purple-50 via-white to-pink-50 overflow-hidden py-16 md:py-24 px-10">
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
        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 bg-pink-200 rounded-full opacity-50 blur-3xl"
      ></motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              i % 2 === 0 ? "bg-purple-300" : "bg-pink-300"
            } opacity-20`}
            style={{
              width: `${Math.random() * 20 + 10}px`,
              height: `${Math.random() * 20 + 10}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 8 + 5,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          {/* Text Content */}
          <motion.div
            className="md:w-1/2 md:pr-12 mb-8 md:mb-0 text-center md:text-left"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={staggerChildren}
          >
            <motion.h1
              className="text-4xl md:text-5xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight"
              variants={fadeIn}
            >
              Discover Your Natural
              <motion.span
                className="block bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                initial={{ backgroundPosition: "0% 50%" }}
                animate={{ backgroundPosition: "100% 50%" }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                Radiance
              </motion.span>
            </motion.h1>

            <motion.div
              className="w-16 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 mx-auto md:mx-0"
              variants={fadeIn}
            ></motion.div>

            <motion.p
              className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg mx-auto md:mx-0"
              variants={fadeIn}
            >
              Organic skincare products crafted with natural ingredients for a
              healthier, more vibrant you. Embrace beauty that comes from
              nature.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              variants={fadeIn}
            >
              <Link href="/products">
                <motion.span
                  className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center justify-center">
                    Shop Now
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </motion.span>
              </Link>
              <Link href="/about">
                <motion.span
                  className="inline-block px-8 py-4 bg-white text-purple-600 rounded-full font-medium hover:bg-gray-50 transition-colors shadow-sm border border-purple-200 hover:border-purple-300 transform hover:-translate-y-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Learn More
                </motion.span>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto md:mx-0"
              variants={staggerChildren}
            >
              <motion.div
                className="flex flex-col items-center"
                variants={fadeIn}
              >
                <div className="text-purple-600 mb-2 bg-purple-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  100% Organic
                </span>
              </motion.div>
              <motion.div
                className="flex flex-col items-center"
                variants={fadeIn}
              >
                <div className="text-purple-600 mb-2 bg-purple-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Cruelty-Free
                </span>
              </motion.div>
              <motion.div
                className="flex flex-col items-center"
                variants={fadeIn}
              >
                <div className="text-purple-600 mb-2 bg-purple-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Free Shipping
                </span>
              </motion.div>
            </motion.div>

            {/* Customer review snippet */}
            <motion.div
              className="mt-10 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 max-w-md mx-auto md:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <div className="flex items-center mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  4.9/5 from 2,800+ reviews
                </span>
              </div>
              <p className="text-sm italic text-gray-600">
                "These products transformed my skin in just a few weeks. Can't
                imagine my routine without them!"
              </p>
              <div className="mt-2 text-xs text-gray-500 flex items-center">
                <span className="font-semibold">Sarah M.</span>
                <span className="mx-1">•</span>
                <span>Verified Customer</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            className="md:w-1/2 relative"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={staggerChildren}
          >
            <motion.div
              className="relative z-10"
              variants={imageVariant}
              whileHover={{ rotate: 0, transition: { duration: 0.3 } }}
            >
              <div className="bg-white p-4 rounded-3xl shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500 relative overflow-hidden">
                {/* Gradient border */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 p-1 rounded-3xl">
                  <div className="w-full h-full bg-white rounded-[22px]"></div>
                </div>

                <div className="relative z-10 rounded-2xl overflow-hidden">
                  <div className="aspect-w-4 aspect-h-5 relative rounded-2xl overflow-hidden">
                    <Image
                      src="https://i.etsystatic.com/6240852/r/il/7c5352/5482632448/il_fullxfull.5482632448_h16x.jpg"
                      alt="Organic skincare products"
                      width={600}
                      height={750}
                      priority
                      className="object-cover transform transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 via-black/20 to-transparent"></div>
                  </div>

                  {/* New product badge */}
                  <div className="absolute top-4 left-4 py-1.5 px-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white text-xs font-bold shadow-lg transform -rotate-6">
                    NEW ARRIVAL
                  </div>

                  {/* Featured product tag */}
                  <motion.div
                    className="absolute bottom-6 left-0 right-0 mx-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <div className="flex items-center">
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900">
                          Miracle Glow Serum
                        </h3>
                        <div className="flex items-center mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className="w-3 h-3 text-yellow-400 fill-current"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-1 text-xs text-gray-500">
                            (512)
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-purple-600 font-bold">$24.99</div>
                        <div className="text-xs text-gray-500 line-through">
                          $34.99
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-green-600 font-medium flex items-center">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        In stock
                      </span>
                      <motion.button
                        className="text-xs font-medium bg-purple-100 text-purple-600 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Quick View
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Decorative elements */}
            <motion.div
              className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-100 rounded-full opacity-70 transform rotate-45 z-0"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [45, 55, 45],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
              }}
            ></motion.div>
            <motion.div
              className="absolute -bottom-8 -left-8 w-40 h-40 bg-purple-100 rounded-full opacity-70 z-0"
              animate={{
                scale: [1, 1.15, 1],
                translateY: [0, -10, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
              }}
            ></motion.div>

            {/* Product specs floating elements */}
            <motion.div
              className="absolute top-20 -right-4 bg-white px-3 py-2 rounded-lg shadow-md text-xs font-medium text-purple-600 z-20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Paraben-Free
              </div>
            </motion.div>
            <motion.div
              className="absolute bottom-40 -left-4 bg-white px-3 py-2 rounded-lg shadow-md text-xs font-medium text-pink-600 z-20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                4.9k Loves
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Wave divider with animation */}
      <div className="absolute bottom-0 left-0 right-0">
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 100"
          className="fill-white w-full h-auto"
          initial="hidden"
          animate="visible"
        >
          <motion.path
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            variants={waveAnimation}
          ></motion.path>
        </motion.svg>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        .float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
