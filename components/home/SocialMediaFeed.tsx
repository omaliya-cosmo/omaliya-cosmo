"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import axios from "axios";
import { Videos } from "@prisma/client";

export default function SocialMediaFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [displayCount, setDisplayCount] = useState(3);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // State for social media content and loading state
  const [socialMediaContent, setSocialMediaContent] = useState<Videos[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch social media content from API
  useEffect(() => {
    const fetchSocialMediaContent = async () => {
      try {
        setLoading(true);
        const response = await axios.get<Videos[]>("/api/videos");
        setSocialMediaContent(response.data);
      } catch (err) {
        console.error("Error fetching social media content:", err);
        // Fallback content in case of API failure
      } finally {
        setLoading(false);
      }
    };

    fetchSocialMediaContent();
  }, []);

  // Check if the current view is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setDisplayCount(
        window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3
      );
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  // Navigation functions for the carousel
  const nextSlide = () => {
    if (currentIndex < socialMediaContent.length - displayCount) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Determine if we can navigate prev/next
  const canScrollPrev = currentIndex > 0;
  const canScrollNext = currentIndex < socialMediaContent.length - displayCount;

  // Animation variants for floating particles
  const floatingParticle = {
    animate: (custom: any) => ({
      y: [0, custom.y, 0],
      x: [0, custom.x, 0],
      opacity: [custom.opacityStart, custom.opacityEnd, custom.opacityStart],
      scale: custom.scale ? [1, custom.scale, 1] : [1, 1, 1],
      transition: {
        duration: custom.duration || 10,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }),
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-purple-50 via-white to-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Social Media Content
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Loading social media content...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="bg-gray-200 h-48 w-96 rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Platform-specific styling and logos
  const getPlatformLogo = (platform: string) => {
    switch (platform) {
      case "youtube":
        return (
          <div className="absolute top-3 left-3 bg-white p-1.5 rounded-full shadow-md z-20">
            <svg
              className="w-5 h-5 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
          </div>
        );
      case "instagram":
        return (
          <div className="absolute top-3 left-3 bg-white p-1.5 rounded-full shadow-md z-20">
            <svg
              className="w-5 h-5 text-pink-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </div>
        );
      case "tiktok":
        return (
          <div className="absolute top-3 left-3 bg-white p-1.5 rounded-full shadow-md z-20">
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
                fill="currentColor"
              />
            </svg>
          </div>
        );
      case "facebook":
        return (
          <div className="absolute top-3 left-3 bg-white p-1.5 rounded-full shadow-md z-20">
            <svg
              className="w-5 h-5 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section
      className="py-16 bg-gradient-to-b from-white to-purple-50 relative overflow-hidden px-12"
      ref={ref}
      id="social-media-feed"
    >
      {/* Animated Background Elements with Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large blurred background gradients */}
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-r from-purple-100/30 to-pink-100/30 blur-3xl"
          style={{ top: "10%", left: "50%", transform: "translateX(-50%)" }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-pink-100/20 to-purple-100/20 blur-3xl"
          style={{ bottom: "10%", right: "5%" }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            repeat: Infinity,
            duration: 25,
            ease: "easeInOut",
          }}
        />

        {/* Floating particles with various sizes and positions */}
        <motion.div
          className="absolute w-16 h-16 rounded-full bg-purple-200/60"
          style={{ top: "15%", left: "10%" }}
          custom={{
            y: -30,
            x: 20,
            opacityStart: 0.5,
            opacityEnd: 0.7,
            duration: 12,
          }}
          variants={floatingParticle}
          animate="animate"
        />

        <motion.div
          className="absolute w-12 h-12 rounded-full bg-pink-200/60"
          style={{ top: "25%", right: "15%" }}
          custom={{
            y: 25,
            x: -15,
            opacityStart: 0.4,
            opacityEnd: 0.6,
            duration: 14,
          }}
          variants={floatingParticle}
          animate="animate"
        />

        <motion.div
          className="absolute w-20 h-20 rounded-full bg-purple-100/50"
          style={{ bottom: "20%", left: "25%" }}
          custom={{
            y: -20,
            x: 15,
            opacityStart: 0.3,
            opacityEnd: 0.5,
            duration: 16,
          }}
          variants={floatingParticle}
          animate="animate"
        />

        <motion.div
          className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-purple-200/40 to-pink-200/40 blur-sm"
          style={{ bottom: "35%", right: "10%" }}
          custom={{
            y: 20,
            x: -10,
            opacityStart: 0.3,
            opacityEnd: 0.5,
            duration: 11,
          }}
          variants={floatingParticle}
          animate="animate"
        />

        <motion.div
          className="absolute w-8 h-8 rounded-full bg-purple-300/50"
          style={{ top: "55%", left: "8%" }}
          custom={{
            y: 15,
            x: 8,
            opacityStart: 0.4,
            opacityEnd: 0.6,
            duration: 9,
          }}
          variants={floatingParticle}
          animate="animate"
        />

        <motion.div
          className="absolute w-10 h-10 rounded-full bg-pink-300/50"
          style={{ top: "40%", right: "20%" }}
          custom={{
            y: -12,
            x: -6,
            opacityStart: 0.4,
            opacityEnd: 0.6,
            duration: 10,
          }}
          variants={floatingParticle}
          animate="animate"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="inline-block bg-purple-100 text-purple-600 px-4 py-1 rounded-full text-sm font-medium mb-3">
            Social Media
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Us On Social Media
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Watch our latest videos showcasing product demonstrations, beauty
            tips, and user testimonials.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative max-w-7xl mx-auto">
          {/* Navigation Arrows - Only visible if there are enough items to scroll */}
          {canScrollPrev && (
            <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-4 md:-translate-x-6">
              <button
                onClick={prevSlide}
                className="bg-white p-2 rounded-full shadow-lg hover:bg-purple-100 transition-colors"
                aria-label="Previous social media post"
              >
                <ChevronLeftIcon className="w-6 h-6 text-purple-800" />
              </button>
            </div>
          )}

          {canScrollNext && (
            <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-4 md:translate-x-6">
              <button
                onClick={nextSlide}
                className="bg-white p-2 rounded-full shadow-lg hover:bg-purple-100 transition-colors"
                aria-label="Next social media post"
              >
                <ChevronRightIcon className="w-6 h-6 text-purple-800" />
              </button>
            </div>
          )}

          {/* Carousel Content */}
          <div className="overflow-hidden">
            <motion.div
              ref={carouselRef}
              className="flex gap-6"
              animate={{ x: -currentIndex * (100 / displayCount) + "%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {socialMediaContent.map((item) => (
                <motion.div
                  key={item.id}
                  className={`flex-shrink-0 ${
                    isMobile ? "w-full" : displayCount === 2 ? "w-1/2" : "w-1/3"
                  }`}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Link
                    href={item.videoUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="bg-white rounded-2xl shadow-md overflow-hidden relative group cursor-pointer">
                      {/* Platform Logo */}
                      {getPlatformLogo(item.platform.toLowerCase())}

                      {/* Video Thumbnail with 9:16 aspect ratio */}
                      <div className="relative pb-[177.78%] bg-gray-200">
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />

                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 rounded-full p-3 transform transition-transform group-hover:scale-110">
                            <svg
                              className="w-8 h-8 text-purple-600"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Video metadata */}
                      <div className="p-4">
                        <h3 className="font-medium mb-2 line-clamp-1">
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            {item.likes}
                          </span>
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                            {item.views}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Dots navigation for mobile */}
          {isMobile && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({
                length: socialMediaContent.length - displayCount + 1,
              }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    currentIndex === index ? "bg-purple-600" : "bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Social Media Button */}
        <div className="text-center mt-10">
          <Link href="/about" target="_blank" rel="noopener noreferrer">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-full text-white bg-gradient-to-r from-purple-600 to-purple-500 shadow-md hover:shadow-lg transition-all duration-300"
            >
              Follow Us On Social Media
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Custom animations for blob effect */}
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
          animation: blob 15s infinite;
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
