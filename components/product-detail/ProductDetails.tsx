"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { 
  FiInfo, 
  FiPackage, 
  FiShield, 
  FiTruck,
  FiChevronDown, 
  FiChevronUp,
  FiMessageSquare,
  FiHelpCircle,
  FiStar,
  FiFileText,
  FiBarChart2,
  FiCheck,
  FiAlertCircle,
  FiClock,
  FiRefreshCw,
  FiThumbsUp
} from "react-icons/fi";
import { Product } from "@prisma/client";

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState("description");
  const [isSticky, setIsSticky] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  
  // Smooth scroll to tabs when clicking on tab links elsewhere on the page
  useEffect(() => {
    const handleTabLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.getAttribute('data-tab-link')) {
        e.preventDefault();
        const tabId = target.getAttribute('data-tab-link');
        if (tabId) {
          setActiveTab(tabId);
          if (tabsRef.current) {
            tabsRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    };
    
    document.addEventListener('click', handleTabLinkClick);
    return () => document.removeEventListener('click', handleTabLinkClick);
  }, []);

  // Handle scroll for sticky tabs
  useEffect(() => {
    const handleScroll = () => {
      if (tabsRef.current) {
        setIsSticky(window.scrollY > tabsRef.current.offsetTop);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parse product features from description or use defaults
  const getProductFeatures = () => {
    // In a real app, you might store these as structured data
    // For now we'll return hardcoded features
    return [
      { name: "Natural and organic ingredients", description: "Made with 100% natural ingredients sourced from sustainable farms" },
      { name: "Paraben-free formula", description: "Free from harmful chemicals and parabens" },
      { name: "Suitable for all skin types", description: "Gentle and effective for sensitive, dry, and oily skin types" },
      { name: "Dermatologically tested", description: "Tested and approved by dermatologists for safety" }
    ];
  };

  // Get FAQs for this product 
  const getProductFAQs = () => {
    return [
      { 
        question: "How often should I use this product?", 
        answer: "For best results, use daily as part of your morning and evening routine. Apply a small amount to clean, dry skin and gently massage in circular motions until fully absorbed. If you have sensitive skin, you may want to start with once daily application and gradually increase to twice daily." 
      },
      { 
        question: "Is this product suitable for sensitive skin?", 
        answer: "Yes, our product is formulated for all skin types, including sensitive skin. We use gentle, non-irritating ingredients and avoid common allergens. However, if you have specific allergies or skin conditions, please check the ingredient list. We always recommend doing a patch test before applying to your face if you have particularly reactive skin." 
      },
      { 
        question: "How long will one bottle/package last?", 
        answer: "With regular use, one package typically lasts 1-2 months depending on usage frequency. For best results, we recommend using a small amount (about the size of a pea) for each application. This ensures you get the maximum benefit while making the product last longer." 
      },
      { 
        question: "Is this product tested on animals?", 
        answer: "No, we're proud to be 100% cruelty-free. We never test on animals and only use ethically sourced ingredients. All our products are certified by Leaping Bunny and PETA as cruelty-free. We're committed to ethical practices throughout our supply chain." 
      },
    ];
  };

  // Animation variants for tab content
  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="mt-16 border-t border-gray-200 pt-10">
      {/* Tabs */}
      <div 
        ref={tabsRef} 
        id="product-tabs" 
        className={`border-b border-gray-200 ${isSticky ? 'lg:relative' : ''}`}
      >
        <div className={`${
          isSticky 
            ? 'fixed top-0 left-0 right-0 bg-white z-50 shadow-md py-2 lg:absolute lg:shadow-none lg:py-0 lg:top-auto lg:left-auto lg:right-auto backdrop-blur-md bg-white/95' 
            : ''}`
        }>
          <nav className="-mb-px flex space-x-1 md:space-x-6 overflow-x-auto hide-scrollbar px-4 md:px-0">
            {[
              { id: "description", icon: <FiInfo />, label: "Description" },
              { id: "features", icon: <FiBarChart2 />, label: "Features" },
              { id: "specifications", icon: <FiFileText />, label: "Specifications" },
              { id: "shipping", icon: <FiTruck />, label: "Shipping" },
              { id: "guarantee", icon: <FiShield />, label: "Guarantee" },
              { id: "faq", icon: <FiHelpCircle />, label: "FAQ" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center 
                  transition-all duration-300 relative
                  ${activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-indigo-50 rounded-t-lg -z-10"
                    initial={false}
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab content with animations */}
      <div className="pt-6">
        <AnimatePresence mode="wait">
          {activeTab === "description" && (
            <motion.div 
              key="description"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={tabContentVariants}
              className="prose prose-indigo max-w-none"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-md mr-2">
                    <FiInfo />
                  </span>
                  Product Description
                </h3>
                
                {/* Basic product rating summary */}
                <div className="flex items-center px-4 py-2 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={star <= 4 ? "text-amber-400 fill-amber-400" : "text-gray-300"}
                        size={16}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm font-medium text-amber-800">4.0 out of 5</span>
                  <span className="ml-2 text-xs text-amber-700 underline cursor-pointer">
                    (42 reviews)
                  </span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl mb-8 shadow-sm border border-indigo-100">
                <div className="flex items-start">
                  <span className="text-indigo-400 text-4xl font-serif mr-3">"</span>
                  <p className="text-indigo-900 italic font-medium">
                    {product.description || "Experience luxury skincare that transforms your daily routine into a moment of self-care."}
                  </p>
                  <span className="text-indigo-400 text-4xl font-serif ml-3 self-end">"</span>
                </div>
              </div>
              
              <div className="text-gray-700">
                <p className="mb-6 text-lg leading-relaxed">
                  Experience the ultimate in skincare with our premium formulation. Designed to nourish and revitalize your skin, this product combines the power of natural ingredients with cutting-edge skincare technology.
                </p>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div 
                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-indigo-200"
                    whileHover={{ y: -5 }}
                  >
                    <h4 className="font-bold text-gray-900 flex items-center text-lg mb-4">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 mr-3">1</span>
                      Key Benefits
                    </h4>
                    <ul className="mt-4 space-y-3">
                      {getProductFeatures().map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                            <FiCheck className="h-3.5 w-3.5 text-green-600" />
                          </span>
                          <span>{feature.name}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-indigo-200"
                    whileHover={{ y: -5 }}
                  >
                    <h4 className="font-bold text-gray-900 flex items-center text-lg mb-4">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 mr-3">2</span>
                      How to Use
                    </h4>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-indigo-600 text-xs font-bold">1</span>
                        </div>
                        <p>Cleanse your face with warm water</p>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-indigo-600 text-xs font-bold">2</span>
                        </div>
                        <p>Apply a small amount to your fingertips</p>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-indigo-600 text-xs font-bold">3</span>
                        </div>
                        <p>Gently massage into skin using circular motions</p>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-indigo-600 text-xs font-bold">4</span>
                        </div>
                        <p>Use morning and evening for best results</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                <div className="mt-12 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <FiThumbsUp className="mr-2 text-indigo-600" />
                    Why Our Customers Love This Product
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white bg-opacity-60 backdrop-blur-sm p-4 rounded-lg">
                      <div className="flex text-amber-400 mb-2">
                        <FiStar className="fill-amber-400" />
                        <FiStar className="fill-amber-400" />
                        <FiStar className="fill-amber-400" />
                        <FiStar className="fill-amber-400" />
                        <FiStar className="fill-amber-400" />
                      </div>
                      <p className="text-gray-700 text-sm italic">"Transformed my skin in just a week. Will definitely repurchase!"</p>
                      <p className="text-gray-500 text-xs mt-2">- Sarah T.</p>
                    </div>
                    <div className="bg-white bg-opacity-60 backdrop-blur-sm p-4 rounded-lg">
                      <div className="flex text-amber-400 mb-2">
                        <FiStar className="fill-amber-400" />
                        <FiStar className="fill-amber-400" />
                        <FiStar className="fill-amber-400" />
                        <FiStar className="fill-amber-400" />
                        <FiStar />
                      </div>
                      <p className="text-gray-700 text-sm italic">"Gentle on my sensitive skin and smells amazing. Love it!"</p>
                      <p className="text-gray-500 text-xs mt-2">- Michael P.</p>
                    </div>
                    <div className="bg-white bg-opacity-60 backdrop-blur-sm p-4 rounded-lg">
                      <div className="flex text-amber-400 mb-2">
                        <FiStar className="fill-amber-400" />
                        <FiStar className="fill-amber-400" />
                        <FiStar className="fill-amber-400" />
                        <FiStar className="fill-amber-400" />
                        <FiStar className="fill-amber-400" />
                      </div>
                      <p className="text-gray-700 text-sm italic">"The best skincare product I've ever used. Worth every penny!"</p>
                      <p className="text-gray-500 text-xs mt-2">- Emma L.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "features" && (
            <motion.div 
              key="features"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={tabContentVariants}
            >
              <div className="flex items-center mb-6">
                <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-md mr-2">
                  <FiBarChart2 />
                </span>
                <h3 className="text-xl font-bold text-gray-900">Product Features</h3>
              </div>
              
              <div className="relative">
                {/* Decorative line */}
                <div className="absolute left-6 top-6 bottom-10 w-0.5 bg-gradient-to-b from-indigo-400 to-purple-400"></div>
                
                <div className="space-y-12 relative">
                  {getProductFeatures().map((feature, index) => (
                    <FeatureItem 
                      key={index} 
                      index={index} 
                      name={feature.name} 
                      description={feature.description} 
                    />
                  ))}
                </div>
              </div>
              
              <div className="mt-12 p-6 rounded-xl shadow-sm bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                <h4 className="text-xl font-bold mb-4">Why Choose Our Product?</h4>
                <p className="text-indigo-100 mb-6">
                  We believe in creating products that are not only effective but also sustainable and ethical. 
                  Our commitment to quality ensures that you receive only the best, while our dedication to 
                  environmental responsibility means you can feel good about your purchase.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <h5 className="font-bold text-white mb-2">Pure Ingredients</h5>
                    <p className="text-indigo-100 text-sm">Only the highest quality, ethically-sourced ingredients make it into our formulations.</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <h5 className="font-bold text-white mb-2">Eco-Friendly</h5>
                    <p className="text-indigo-100 text-sm">Sustainable packaging and production methods to minimize our environmental impact.</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <h5 className="font-bold text-white mb-2">Cruelty-Free</h5>
                    <p className="text-indigo-100 text-sm">We never test on animals and are proud to be certified cruelty-free.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "specifications" && (
            <motion.div 
              key="specifications"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={tabContentVariants}
            >
              <div className="flex items-center mb-6">
                <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-md mr-2">
                  <FiFileText />
                </span>
                <h3 className="text-xl font-bold text-gray-900">Product Specifications</h3>
              </div>
              
              <div className="overflow-hidden bg-white shadow-sm sm:rounded-xl border border-gray-200 divide-y divide-gray-200">
                <div className="bg-gray-50 px-6 py-5 flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">Technical Details</h4>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                    Premium Quality
                  </span>
                </div>
                
                <SpecRow label="Product Name" value={product.name} />
                <SpecRow label="Weight" value="100g" highlight />
                <SpecRow label="Dimensions" value="5 x 3 x 2 inches" />
                <SpecRow 
                  label="Ingredients" 
                  value="Aqua, Glycerin, Butylene Glycol, Niacinamide, Sodium Hyaluronate" 
                  highlight 
                />
                <SpecRow label="Country of Origin" value="Sri Lanka" />
                <SpecRow label="Shelf Life" value="24 months" highlight />
                <SpecRow 
                  label="Storage Instructions" 
                  value="Store in a cool, dry place away from direct sunlight." 
                />
                <SpecRow 
                  label="Certifications" 
                  value={(
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Organic</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">Cruelty-Free</span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">Vegan</span>
                    </div>
                  )} 
                />
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-5">
                  <div className="flex items-center mb-3">
                    <FiAlertCircle className="text-orange-500 mr-2" size={20} />
                    <h4 className="font-medium text-orange-800">Allergen Information</h4>
                  </div>
                  <p className="text-orange-700 text-sm">
                    This product is free from common allergens including nuts, gluten, and dairy. 
                    However, if you have specific allergies, please review the complete ingredient list.
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-100 rounded-xl p-5">
                  <div className="flex items-center mb-3">
                    <FiCheck className="text-green-500 mr-2" size={20} />
                    <h4 className="font-medium text-green-800">Compatibility</h4>
                  </div>
                  <p className="text-green-700 text-sm">
                    This product can be safely used with most other skincare products. For best results, 
                    apply after cleansing and toning, but before heavier moisturizers and oils.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "shipping" && (
            <motion.div 
              key="shipping"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={tabContentVariants}
              className="prose prose-indigo max-w-none"
            >
              <div className="flex items-center mb-6">
                <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-md mr-2">
                  <FiTruck />
                </span>
                <h3 className="text-xl font-bold text-gray-900">Shipping & Returns</h3>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-8 border border-blue-100">
                <div className="flex items-center mb-4">
                  <FiClock className="text-blue-600 mr-3" size={24} />
                  <div>
                    <h4 className="font-bold text-blue-900">Fast Delivery</h4>
                    <p className="text-blue-700 text-sm">Most orders ship within 24 hours of purchase</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 transition-all hover:shadow-md">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 py-3 px-4">
                    <h4 className="font-bold text-white flex items-center text-lg">
                      <FiTruck className="mr-2" />
                      Shipping Information
                    </h4>
                  </div>
                  <div className="p-5">
                    <p className="text-gray-700 mb-4">
                      We ship to all major cities in Sri Lanka. Standard delivery takes 3-5 business days.
                      Express shipping options are available at checkout.
                    </p>
                    <div className="bg-gray-50 rounded-xl overflow-hidden">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-3 font-medium text-left text-gray-700">Shipping Method</th>
                            <th className="px-4 py-3 font-medium text-left text-gray-700">Time</th>
                            <th className="px-4 py-3 font-medium text-left text-gray-700">Fee</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3">Standard Shipping</td>
                            <td className="px-4 py-3">3-5 days</td>
                            <td className="px-4 py-3">Rs. 350</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3">Express Shipping</td>
                            <td className="px-4 py-3">1-2 days</td>
                            <td className="px-4 py-3">Rs. 750</td>
                          </tr>
                          <tr className="hover:bg-gray-50 bg-green-50">
                            <td className="px-4 py-3 font-medium text-green-800">Free Shipping</td>
                            <td className="px-4 py-3 text-green-800">3-5 days</td>
                            <td className="px-4 py-3 text-green-800">Orders over Rs. 5,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 transition-all hover:shadow-md">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 py-3 px-4">
                    <h4 className="font-bold text-white flex items-center text-lg">
                      <FiRefreshCw className="mr-2" />
                      Return Policy
                    </h4>
                  </div>
                  <div className="p-5">
                    <p className="text-gray-700 mb-4">
                      If you're not completely satisfied with your purchase, you can return it within 
                      30 days for a full refund. Items must be unused and in their original packaging.
                    </p>
                    <div className="border border-green-100 rounded-xl p-4 bg-green-50">
                      <h5 className="font-medium text-green-800 mb-2">Easy Returns Process:</h5>
                      <ol className="space-y-2 text-sm text-green-700">
                        <li className="flex items-start">
                          <span className="bg-green-200 text-green-800 w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">1</span>
                          <span>Contact our customer service team</span>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-green-200 text-green-800 w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">2</span>
                          <span>Receive a return shipping label via email</span>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-green-200 text-green-800 w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">3</span>
                          <span>Pack the item in its original packaging</span>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-green-200 text-green-800 w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">4</span>
                          <span>Drop off at any post office or schedule a pickup</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 transition-all hover:shadow-md">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 py-3 px-4">
                    <h4 className="font-bold text-white flex items-center text-lg">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      International Orders
                    </h4>
                  </div>
                  <div className="p-5">
                    <p className="text-gray-700 mb-4">
                      We ship worldwide. International orders typically arrive within 7-14 business days.
                      Import duties and taxes may apply and are the responsibility of the customer.
                    </p>
                    <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-4">
                      <div className="flex">
                        <FiAlertCircle className="text-amber-500 flex-shrink-0 mt-0.5 mr-2" />
                        <div>
                          <h5 className="font-medium text-amber-800 mb-1">Important Note</h5>
                          <p className="text-sm text-amber-700">
                            International shipping fees and delivery times may vary depending on destination. 
                            Please check the checkout page for specific details for your country.
                          </p>
                          <ul className="mt-2 text-xs text-amber-700 space-y-1">
                            <li>• Customs duties are not included in the shipping cost</li>
                            <li>• Tracking information will be provided for all international shipments</li>
                            <li>• Please ensure your address is correct to avoid delivery issues</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "guarantee" && (
            <motion.div 
              key="guarantee"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={tabContentVariants}
              className="prose prose-indigo max-w-none"
            >
              <div className="flex items-center mb-6">
                <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-md mr-2">
                  <FiShield />
                </span>
                <h3 className="text-xl font-bold text-gray-900">Our Guarantee</h3>
              </div>
              
              <div className="relative overflow-hidden rounded-2xl shadow-lg mb-10">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-90"></div>
                <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-20"></div>
                <div className="relative p-8 text-white">
                  <div className="inline-block mb-4 bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <FiShield className="h-8 w-8" />
                  </div>
                  <h4 className="font-bold text-3xl mb-2">100% Satisfaction Guarantee</h4>
                  <p className="text-indigo-100 text-lg max-w-2xl">
                    We stand behind every product we sell with a 30-day money-back guarantee.
                    If you're not completely satisfied, we'll make it right — no questions asked.
                  </p>
                  <div className="mt-6 inline-block bg-white px-5 py-2.5 rounded-lg text-indigo-700 font-bold shadow-sm hover:bg-white/90 transition-colors cursor-pointer">
                    Learn More
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <GuaranteeCard 
                  icon={<FiShield className="h-6 w-6 text-indigo-600" />}
                  title="Quality Promise"
                  description="All of our products are made with the highest quality natural ingredients and undergo rigorous testing to ensure they meet our strict standards."
                  bgColor="bg-indigo-50"
                  borderColor="border-indigo-100"
                  iconBgColor="bg-indigo-100"
                />
                
                <GuaranteeCard 
                  icon={<svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>}
                  title="Safe and Secure"
                  description="Your safety is our priority. Our products are formulated without harmful chemicals and are manufactured in certified facilities."
                  bgColor="bg-green-50"
                  borderColor="border-green-100"
                  iconBgColor="bg-green-100"
                />
                
                <GuaranteeCard 
                  icon={<FiRefreshCw className="h-6 w-6 text-blue-600" />}
                  title="Easy Returns"
                  description="Unhappy with your purchase? Our hassle-free return process makes it easy to get a refund or exchange within 30 days."
                  bgColor="bg-blue-50"
                  borderColor="border-blue-100"
                  iconBgColor="bg-blue-100"
                />
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h4 className="font-bold text-gray-900">How Our Guarantee Works</h4>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {[
                      { 
                        step: 1, 
                        title: "Contact Us", 
                        description: "If you're not satisfied with your purchase for any reason, contact our customer service within 30 days." 
                      },
                      { 
                        step: 2, 
                        title: "Return Instructions", 
                        description: "We'll provide detailed instructions for returning the product along with a prepaid shipping label." 
                      },
                      { 
                        step: 3, 
                        title: "Ship It Back", 
                        description: "Pack the item in its original packaging and send it back using the provided shipping label." 
                      },
                      { 
                        step: 4, 
                        title: "Get Your Refund", 
                        description: "Once we receive the returned item, we'll process your refund within 3-5 business days." 
                      },
                    ].map((item) => (
                      <div key={item.step} className="flex">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                            {item.step}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">{item.title}</h5>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "faq" && (
            <motion.div 
              key="faq"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={tabContentVariants}
            >
              <div className="flex items-center mb-6">
                <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-md mr-2">
                  <FiHelpCircle />
                </span>
                <h3 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h3>
              </div>
              
              <div className="mb-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-6 border border-indigo-100 shadow-sm">
                <p className="text-indigo-700">
                  Find answers to common questions about this product. If you don't see your question listed here,
                  feel free to contact our customer support team.
                </p>
              </div>
              
              <div className="space-y-4 mb-10">
                {getProductFAQs().map((faq, index) => (
                  <FAQ 
                    key={index}
                    question={faq.question}
                    answer={faq.answer}
                  />
                ))}
              </div>
              
              <div className="mt-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl overflow-hidden shadow-lg">
                <div className="px-6 py-8 md:flex items-center justify-between">
                  <div className="text-white mb-6 md:mb-0">
                    <h4 className="font-bold text-xl mb-2">Still have questions?</h4>
                    <p className="text-indigo-100 max-w-xl">
                      Our customer support team is ready to assist you with any questions about this product.
                      We typically respond within 24 hours.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <button className="bg-white px-6 py-3 rounded-lg text-indigo-700 font-bold shadow-sm hover:bg-indigo-50 transition-colors flex items-center">
                      <FiMessageSquare className="mr-2" />
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Component for displaying a feature with animation
const FeatureItem = ({ index, name, description }: { index: number; name: string; description: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });
  
  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="ml-12"
    >
      <div className="absolute left-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
          {index + 1}
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all">
        <h4 className="font-bold text-gray-900 text-lg mb-2">{name}</h4>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
};

// Component for specification rows
const SpecRow = ({ 
  label, 
  value, 
  highlight = false 
}: { 
  label: string; 
  value: string | React.ReactNode; 
  highlight?: boolean;
}) => (
  <div className={`px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ${highlight ? 'bg-gray-50' : 'bg-white'}`}>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{value}</dd>
  </div>
);

// Guarantee card component
const GuaranteeCard = ({ 
  icon, 
  title, 
  description,
  bgColor = "bg-white",
  borderColor = "border-gray-200",
  iconBgColor = "bg-gray-100"
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  bgColor?: string;
  borderColor?: string;
  iconBgColor?: string;
}) => (
  <motion.div 
    className={`rounded-xl shadow-sm overflow-hidden border ${borderColor} ${bgColor} transition-all duration-300`}
    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
  >
    <div className="p-6">
      <div className="flex items-center mb-4">
        <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-2 mr-3`}>
          {icon}
        </div>
        <h5 className="font-bold text-gray-900">{title}</h5>
      </div>
      <p className="text-gray-600 text-sm">
        {description}
      </p>
    </div>
  </motion.div>
);

// FAQ component for expandable Q&A with improved styling
const FAQ = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:border-indigo-200">
      <button
        className={`flex w-full items-center justify-between px-6 py-4 text-left focus:outline-none transition-colors ${
          isOpen ? 'bg-indigo-50' : 'bg-white hover:bg-gray-50'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`font-medium ${isOpen ? 'text-indigo-700' : 'text-gray-900'}`}>
          {question}
        </span>
        <span className={`ml-6 flex-shrink-0 p-1 rounded-full ${isOpen ? 'bg-indigo-100' : ''}`}>
          {isOpen ? (
            <FiChevronUp className={`h-5 w-5 ${isOpen ? 'text-indigo-500' : 'text-gray-500'}`} />
          ) : (
            <FiChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <p className="text-gray-600">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetails;