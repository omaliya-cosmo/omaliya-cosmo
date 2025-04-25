import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const particlesData = [
  {
    width: "29.76px",
    height: "13.57px",
    top: "32.95%",
    left: "29.66%",
    color: "bg-purple-300",
  },
  {
    width: "24.78px",
    height: "24.73px",
    top: "88.42%",
    left: "52.65%",
    color: "bg-pink-300",
  },
  {
    width: "25.96px",
    height: "18.52px",
    top: "51.19%",
    left: "3.12%",
    color: "bg-purple-300",
  },
  {
    width: "29.43px",
    height: "12.18px",
    top: "32.62%",
    left: "90.50%",
    color: "bg-pink-300",
  },
  {
    width: "19.18px",
    height: "29.13px",
    top: "31.22%",
    left: "44.59%",
    color: "bg-purple-300",
  },
  {
    width: "13.88px",
    height: "16.73px",
    top: "3.76%",
    left: "2.25%",
    color: "bg-pink-300",
  },
  {
    width: "18.67px",
    height: "12.27px",
    top: "7.63%",
    left: "46.61%",
    color: "bg-purple-300",
  },
  {
    width: "27.36px",
    height: "11.76px",
    top: "97.97%",
    left: "10.37%",
    color: "bg-pink-300",
  },
];

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
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
    <section className="relative bg-gradient-to-br from-purple-50 via-white to-pink-50 overflow-hidden py-16 md:py-10 px-10 md:px-16">
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

      {/* Floating particles - Using predefined values instead of random */}
      <div className="absolute inset-0 overflow-hidden">
        {particlesData.map((particle, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${particle.color} opacity-20`}
            style={{
              width: particle.width,
              height: particle.height,
              top: particle.top,
              left: particle.left,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, ((i % 3) - 1) * 10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.7,
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
              Your One-Stop for
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
                Everything
              </motion.span>
              Online!
            </motion.h1>

            <motion.div
              className="w-16 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 mx-auto md:mx-0"
              variants={fadeIn}
            ></motion.div>

            <motion.p
              className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg mx-auto md:mx-0"
              variants={fadeIn}
            >
              Discover Your Style, Fast! Shop trends, enjoy exclusive deals, and
              get premium products delivered to your door. Start exploring
              today!
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
                "Sleek design, smooth navigation, fast checkout, great
                deals—shopping here feels effortless and enjoyable."
              </p>
              <div className="mt-2 text-xs text-gray-500 flex items-center">
                <span className="font-semibold">Kasuni Perera</span>
                <span className="mx-1">•</span>
                <span>Verified Customer</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            className="md:w-5/12 relative mx-auto mt-0 md:-mt-36"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={staggerChildren}
          >
            <motion.div
              className="relative z-10"
              variants={imageVariant}
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            >
              {/* Model image with background removed - with fade-out gradient */}
              <div className="relative px-4 pb-5 md:pb-10">
                {/* Image shadow for better blending */}
                <div className="absolute bottom-0 left-1/2 w-3/4 h-16 bg-black opacity-10 blur-xl rounded-full transform -translate-x-1/2"></div>

                {/* Image container with padding and fade-out effect */}
                <div className="relative">
                  <Image
                    src="https://res.cloudinary.com/omaliya/image/upload/w_1600,q_auto,f_auto/v1745341388/Hero2_1_iqfrc5.png"
                    alt="Fashion model"
                    width={550}
                    height={700}
                    sizes="(max-width: 640px) 280px, (max-width: 768px) 350px, 450px"
                    priority
                    className="object-contain w-full h-auto max-w-[280px] sm:max-w-[350px] md:max-w-[450px] mx-auto"
                  />

                  {/* Fade-out gradient overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-gradient-to-t from-[#f9f5ff] to-transparent"></div>
                </div>
              </div>
            </motion.div>

            {/* Animated promotional texts orbiting around the image */}

            {/* 20% OFF - Top right */}
            <motion.div
              className="absolute top-5 md:top-10 right-0 md:-right-4 bg-red-500 px-3 md:px-4 py-1 md:py-2 rounded-full shadow-md text-xs md:text-sm font-bold text-white z-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: [1, 1.1, 1],
                x: [0, 15, 0, -15, 0],
                y: [0, -10, -15, -5, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "loop",
              }}
            >
              20% OFF
            </motion.div>

            {/* NEW ARRIVAL - Right middle */}
            <motion.div
              className="absolute top-1/4 right-0 md:-right-8 bg-purple-600 px-2 md:px-4 py-1 md:py-2 rounded-full shadow-lg text-xs md:text-sm font-bold text-white z-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                x: [0, 20, 10, -5, 0],
                y: [0, -15, 0, 15, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: "loop",
                delay: 0.5,
              }}
            >
              NEW ARRIVAL
            </motion.div>

            {/* TRENDING - Bottom right */}
            <motion.div
              className="absolute bottom-1/3 right-0 md:-right-6 bg-yellow-400 px-2 md:px-4 py-1 md:py-2 rounded-full shadow-md text-xs md:text-sm font-medium text-white z-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                x: [0, 15, 0, -15, 0],
                y: [0, 10, 15, 5, 0],
              }}
              transition={{
                duration: 9,
                repeat: Infinity,
                repeatType: "loop",
                delay: 1,
              }}
            >
              TRENDING
            </motion.div>

            {/* MUST-HAVE - Left middle */}
            <motion.div
              className="absolute top-1/3 left-0 md:-left-6 bg-gradient-to-r from-pink-500 to-purple-500 px-2 md:px-4 py-1 md:py-2 rounded-full shadow-md text-xs md:text-sm font-bold text-white z-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                x: [0, -15, 0, 15, 0],
                y: [0, -10, 0, 10, 0],
              }}
              transition={{
                duration: 11,
                repeat: Infinity,
                repeatType: "loop",
                delay: 1.5,
              }}
            >
              MUST-HAVE
            </motion.div>

            {/* LIMITED TIME - Bottom left */}
            <motion.div
              className="absolute bottom-1/4 left-0 md:-left-8 bg-cyan-600 px-2 md:px-4 py-1 md:py-2 rounded-full shadow-md text-xs md:text-sm font-medium text-white z-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                x: [0, -20, -10, 5, 0],
                y: [0, 10, 20, 10, 0],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                repeatType: "loop",
                delay: 2,
              }}
            >
              LIMITED TIME
            </motion.div>

            {/* SHOP NOW - Bottom */}
            <motion.div
              className="absolute bottom-10 md:bottom-20 left-1/2 transform -translate-x-1/2 bg-white px-3 md:px-5 py-1.5 md:py-2.5 rounded-full shadow-lg text-xs md:text-sm font-bold text-purple-600 z-20 border-2 border-purple-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: [1, 1.15, 1],
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              SHOP NOW
            </motion.div>

            {/* HOT OFFER - Top */}
            <motion.div
              className="absolute top-12 left-0 md:-left-4 bg-orange-500 px-2 md:px-4 py-1 md:py-2 rounded-full shadow-md text-xs md:text-sm font-bold text-white z-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                x: [0, -10, -15, -5, 0],
                y: [0, -15, -5, -15, 0],
              }}
              transition={{
                duration: 9,
                repeat: Infinity,
                repeatType: "loop",
                delay: 0.7,
              }}
            >
              HOT OFFER
            </motion.div>

            {/* DON'T MISS OUT - Far right */}
            <motion.div
              className="absolute top-1/2 right-0 md:-right-10 bg-green-600 px-2 md:px-4 py-1 md:py-2 rounded-full shadow-md text-xs md:text-sm font-bold text-white z-20 hidden sm:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                x: [0, 15, 25, 15, 0],
                y: [0, -5, 0, 5, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: "loop",
                delay: 2.2,
              }}
            >
              DON&apos;T MISS OUT
            </motion.div>

            {/* Animated circle decorations */}
            <motion.div
              className="absolute -top-5 -right-5 md:-top-10 md:-right-10 w-20 md:w-32 h-20 md:h-32 bg-purple-50 rounded-full opacity-70 transform rotate-45 z-0"
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
              className="absolute -bottom-4 -left-4 md:-bottom-8 md:-left-8 w-24 md:w-40 h-24 md:h-40 bg-pink-50 rounded-full opacity-70 z-0"
              animate={{
                scale: [1, 1.15, 1],
                translateY: [0, -10, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
              }}
            ></motion.div>

            {/* FLASH SALE tag with price - Bottom right */}
            <motion.div
              className="absolute bottom-4 md:bottom-10 right-0 bg-white px-3 md:px-4 py-2 md:py-3 rounded-xl shadow-lg text-sm md:text-base font-bold z-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: [1, 1.05, 1],
                rotate: [0, -1, 0, 1, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "mirror",
              }}
            >
              <div className="flex flex-col items-end">
                <span className="text-[10px] md:text-xs text-gray-500 line-through">
                  $49.99
                </span>
                <span className="text-purple-600">$29.99</span>
                <div className="absolute -top-2 -left-2 bg-red-500 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                  FLASH SALE
                </div>
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
