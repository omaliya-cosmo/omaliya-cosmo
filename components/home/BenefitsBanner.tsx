import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useAnimation, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function BenefitsBanner() {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const benefits = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Certified Organic',
      description: 'All ingredients are certified organic and sourced responsibly from trusted suppliers',
      color: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50',
      icon2: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Cruelty-Free',
      description: 'We never test on animals and are proudly certified by Leaping Bunny and PETA',
      color: 'from-pink-500 to-rose-600',
      bgLight: 'bg-pink-50',
      icon2: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
        </svg>
      ),
      title: 'Dermatologist Tested',
      description: 'All products undergo rigorous testing by certified dermatologists for safety',
      color: 'from-purple-500 to-indigo-600',
      bgLight: 'bg-purple-50',
      icon2: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      title: 'Recyclable Packaging',
      description: 'Our packaging is made from recycled materials and is 100% recyclable',
      color: 'from-cyan-500 to-blue-600',
      bgLight: 'bg-cyan-50',
      icon2: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    }
  ];

  return (
    <section 
      className="py-20 md:py-28 overflow-hidden relative bg-white" 
      ref={ref}
      id="benefits"
    >
      {/* Parallax Background - White only */}
      <motion.div 
        className="absolute inset-0 z-0" 
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0 bg-white opacity-90"></div>
        
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#smallGrid)" />
          </svg>
        </div>
      </motion.div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4 shadow-sm">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            We Make Beauty <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">Natural & Sustainable</span>
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-600 text-lg md:text-xl mb-8">
              We believe in creating products that are good for you and the planet, without compromising on quality or efficacy.
            </p>
            <div className="w-24 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto"></div>
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index} 
              className="rounded-2xl overflow-hidden group relative"
              variants={itemVariants}
              whileHover={{ 
                y: -6,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Card with glass morphism effect */}
              <div className="relative h-full backdrop-blur-sm bg-white/80 shadow-xl rounded-2xl p-8 border border-white/20 overflow-hidden flex flex-col">
                {/* Top decoration */}
                <div className="absolute -top-10 -right-10 w-40 h-40">
                  <div className={`w-full h-full rounded-full ${benefit.bgLight} opacity-20 blur-xl`}></div>
                </div>
                
                {/* Bottom corner decoration */}
                <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full border-4 border-purple-100/30"></div>
                
                {/* Icon with gradient background */}
                <div className="relative mb-6 inline-block">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${benefit.color} blur-md opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                  <div className={`relative z-10 inline-flex items-center justify-center w-20 h-20 ${benefit.bgLight} text-gray-800 rounded-full mb-6 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3`}>
                    {benefit.icon}
                  </div>
                </div>
                
                {/* Small floating accent icon */}
                <motion.div 
                  className={`absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r ${benefit.color} text-white shadow-lg`}
                  animate={{ 
                    y: [0, -6, 0],
                    opacity: [0.8, 1, 0.8],
                    scale: [1, 1.05, 1] 
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                >
                  {benefit.icon2}
                </motion.div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-purple-700 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors flex-grow">
                  {benefit.description}
                </p>
                
                {/* Learn more button that appears on hover */}
                <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100 pt-0 group-hover:pt-4 mt-0 group-hover:mt-2 transform translate-y-4 group-hover:translate-y-0">
                  <Link 
                    href="#" 
                    className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    Learn more
                    <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 30 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="relative"
        >
          {/* Highlighted commitment banner */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl transform -rotate-1 scale-105 opacity-70"></div>
          
          <div className="relative backdrop-blur-sm bg-white/90 rounded-3xl shadow-xl overflow-hidden border border-white/50">
            {/* Decorative elements */}
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-gradient-to-br from-purple-200/40 to-transparent"></div>
            <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-gradient-to-br from-pink-200/40 to-transparent"></div>
            
            {/* Content with enhanced layout */}
            <div className="p-8 md:p-12 relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-8 md:mb-0 md:w-2/3 md:pr-12">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 shadow-sm mb-6">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mr-2"></span>
                    <span className="text-purple-700 font-semibold text-sm tracking-wide">Our Commitment</span>
                  </div>
                  
                  <h3 className="text-3xl font-bold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                    Our Promise To You
                  </h3>
                  
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    We're committed to transparency, sustainability, and creating products that enhance your natural beauty. Experience the Omaliya difference with our 30-day satisfaction guarantee.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { text: '30-Day Guarantee', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                      { text: 'Ethical Ingredients', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
                      { text: 'Free Shipping Over $50', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' }
                    ].map((item, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + (i * 0.2) }}
                        className="flex flex-col items-center sm:items-start"
                      >
                        <div className="flex items-center mb-2">
                          <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mr-2">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                            </svg>
                          </div>
                          <span className="text-gray-800 font-medium">{item.text}</span>
                        </div>
                        {/* Animated progress bar */}
                        <motion.div 
                          className="w-full h-1 bg-purple-100 rounded-full mt-1 overflow-hidden"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ delay: 1 + (i * 0.2), duration: 0.8, ease: "easeOut" }}
                        >
                          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <div className="md:w-1/3 flex flex-col items-center">
                  {/* Badge with custom shape */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-md transform scale-110"></div>
                    <motion.div 
                      className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-1 font-bold text-xs tracking-wider shadow-md"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [-2, 0, -2] 
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                        CERTIFIED CLEAN BEAUTY
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Image with border */}
                  <div className="relative w-64 h-64 mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl transform -rotate-3 scale-105 opacity-30"></div>
                    <div className="absolute inset-0 transform rotate-3 bg-white rounded-3xl overflow-hidden border-2 border-purple-100 shadow-lg">
                      <Image 
                        src="/images/natural-ingredients.jpg" 
                        alt="Natural ingredients" 
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent"></div>
                    </div>
                  </div>
                  
                  <Link 
                    href="/about"
                    className="relative group"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-70 blur-sm group-hover:opacity-100 transition duration-200"></div>
                    <button className="relative flex items-center justify-center px-8 py-4 bg-white text-purple-700 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 font-semibold">
                        Learn More
                      </span>
                      <div className="flex items-center justify-center ml-2 w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white transform group-hover:translate-x-1 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Trust indicators */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-6">Trusted By Industry Leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-70">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 1.4 + (i * 0.1), duration: 0.5 }}
                whileHover={{ opacity: 1, scale: 1.05 }}
                className="grayscale hover:grayscale-0 transition-all duration-300"
              >
                <div className="h-10 w-auto">
                  {/* Replace with actual partner logos */}
                  <div className="w-24 h-10 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 text-xs">
                    PARTNER {i+1}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
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