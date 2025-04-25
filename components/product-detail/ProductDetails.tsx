"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiInfo,
  FiShield,
  FiChevronDown,
  FiChevronUp,
  FiMessageSquare,
  FiHelpCircle,
  FiStar,
  FiCheck,
  FiThumbsUp,
  FiRefreshCw,
} from "react-icons/fi";
import {
  Customer,
  Product as PrismaProduct,
  ProductCategory,
  Review as PrismaReview,
} from "@prisma/client";
import ProductReviews from "@/components/product-detail/ProductReviews";

interface Review extends PrismaReview {
  customer: Customer;
}

interface Product extends PrismaProduct {
  category: ProductCategory;
  reviews: Review[];
}

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
      if (target.getAttribute("data-tab-link")) {
        e.preventDefault();
        const tabId = target.getAttribute("data-tab-link");
        if (tabId) {
          setActiveTab(tabId);
          if (tabsRef.current) {
            tabsRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    };

    document.addEventListener("click", handleTabLinkClick);
    return () => document.removeEventListener("click", handleTabLinkClick);
  }, []);

  // Handle scroll for sticky tabs
  useEffect(() => {
    const handleScroll = () => {
      if (tabsRef.current) {
        setIsSticky(window.scrollY > tabsRef.current.offsetTop);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get FAQs for this product
  const getProductFAQs = () => {
    return [
      {
        question: "How often should I use this product?",
        answer:
          "Usage frequency depends on the product type. Refer to the usage instructions provided with the item. For general use, follow daily or as needed to achieve optimal results.",
      },
      {
        question: "Is this product suitable for all users?",
        answer:
          "Yes, this product is designed to be suitable for a wide range of users. However, we recommend reviewing the specifications and compatibility details to ensure it meets your individual needs.",
      },
      {
        question: "How long will one unit last?",
        answer:
          "The lifespan of the product depends on usage frequency and conditions. On average, one unit is expected to last 1–2 months with regular use.",
      },
      {
        question: "Is this product ethically made?",
        answer:
          "Yes, we are committed to ethical practices. This product is made following responsible sourcing, manufacturing, and environmental standards. No animal testing is involved.",
      },
    ];
  };

  // Animation variants for tab content
  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="mt-16 border-t border-gray-200 pt-10">
      {/* Tabs */}
      <div
        ref={tabsRef}
        id="product-tabs"
        className={`border-b border-gray-200 ${isSticky ? "lg:relative" : ""}`}
      >
        <div
          className={`${
            isSticky
              ? "fixed top-0 left-0 right-0 bg-white shadow-md py-2 lg:absolute lg:shadow-none lg:py-0 lg:top-auto lg:left-auto lg:right-auto backdrop-blur-md bg-white/95"
              : ""
          }`}
        >
          <nav className="-mb-px flex space-x-1 md:space-x-6 overflow-x-auto hide-scrollbar px-4 md:px-0">
            {[
              { id: "description", icon: <FiInfo />, label: "Description" },
              { id: "reviews", icon: <FiStar />, label: "Reviews" },
              { id: "guarantee", icon: <FiShield />, label: "Guarantee" },
              { id: "faq", icon: <FiHelpCircle />, label: "FAQ" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center 
                  transition-all duration-300 relative
                  ${
                    activeTab === tab.id
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
                        className={
                          star <= 4
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-300"
                        }
                        size={16}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm font-medium text-amber-800">
                    4.0 out of 5
                  </span>
                  <span
                    className="ml-2 text-xs text-amber-700 underline cursor-pointer"
                    onClick={() => setActiveTab("reviews")}
                  >
                    ({product.reviews.length || 0} reviews)
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-xl mb-8 shadow-sm border border-indigo-100">
                <div
                  className="quill-content"
                  dangerouslySetInnerHTML={{
                    __html: product.fullDescription || product.description,
                  }}
                />
              </div>
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={tabContentVariants}
            >
              <div className="flex items-center mb-6">
                <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-md mr-2">
                  <FiStar />
                </span>
                <h3 className="text-xl font-bold text-gray-900">
                  Customer Reviews
                </h3>
              </div>

              {/* Embed the ProductReviews component inside the Reviews tab */}
              <ProductReviews
                reviews={product.reviews}
                productId={product.id}
              />
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
                <h3 className="text-xl font-bold text-gray-900">
                  Our Guarantee
                </h3>
              </div>

              <div className="relative overflow-hidden rounded-2xl shadow-lg mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-90"></div>
                <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-20"></div>
                <div className="relative p-8 text-white">
                  <div className="inline-block mb-4 bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <FiShield className="h-8 w-8" />
                  </div>
                  <h4 className="font-bold text-3xl mb-2">
                    100% Satisfaction Guarantee
                  </h4>
                  <p className="text-indigo-100 text-lg max-w-2xl">
                    Experience peace of mind with our 100% Satisfaction
                    Guarantee — crafted with care, our product is built to meet
                    your expectations and deliver exceptional value.
                  </p>
                  <div className="mt-6 inline-block bg-white px-5 py-2.5 rounded-lg text-indigo-700 font-bold shadow-sm hover:bg-white/90 transition-colors cursor-pointer">
                    Learn More
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <GuaranteeCard
                  icon={<FiShield className="h-6 w-6 text-indigo-600" />}
                  title="Quality Promise"
                  description="All of our products are made with the highest quality natural ingredients and undergo rigorous testing to ensure they meet our strict standards."
                  bgColor="bg-indigo-50"
                  borderColor="border-indigo-100"
                  iconBgColor="bg-indigo-100"
                />

                <GuaranteeCard
                  icon={
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  }
                  title="Safe and Secure"
                  description="Your safety is our priority. Our products are formulated without harmful chemicals and are manufactured in certified facilities."
                  bgColor="bg-green-50"
                  borderColor="border-green-100"
                  iconBgColor="bg-green-100"
                />

                <GuaranteeCard
                  icon={<FiRefreshCw className="h-6 w-6 text-blue-600" />}
                  title="Satisfaction Guaranteed"
                  description="We’re confident you’ll love it — thoughtfully made to deliver quality and comfort, backed by our commitment to your satisfaction."
                  bgColor="bg-blue-50"
                  borderColor="border-blue-100"
                  iconBgColor="bg-blue-100"
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-10">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h4 className="font-bold text-gray-900">
                    How Our Guarantee Supports You
                  </h4>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {[
                      {
                        step: 1,
                        title: "Reach Out to Us",
                        description:
                          "Have questions or concerns? Our friendly support team is here to help and ensure your satisfaction.",
                      },
                      {
                        step: 2,
                        title: "Personalized Assistance",
                        description:
                          "We’ll work with you directly to understand the issue and offer helpful solutions tailored to your experience.",
                      },
                      {
                        step: 3,
                        title: "Ongoing Support",
                        description:
                          "Whether it’s product guidance or general inquiries, we stay connected to make sure you're fully satisfied.",
                      },
                      {
                        step: 4,
                        title: "Confidence in Every Purchase",
                        description:
                          "Our commitment means you can shop worry-free, knowing we stand by the quality of everything we offer.",
                      },
                    ].map((item) => (
                      <div key={item.step} className="flex">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                            {item.step}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">
                            {item.title}
                          </h5>
                          <p className="text-gray-600 text-sm">
                            {item.description}
                          </p>
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
                <h3 className="text-xl font-bold text-gray-900">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="mb-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-6 py-4 border border-indigo-100 shadow-sm">
                <p className="text-indigo-700">
                  Find answers to common questions about this product. If you
                  don't see your question listed here, feel free to contact our
                  customer support team.
                </p>
              </div>

              <div className="space-y-4">
                {getProductFAQs().map((faq, index) => (
                  <FAQ
                    key={index}
                    question={faq.question}
                    answer={faq.answer}
                  />
                ))}
              </div>

              <div className="mt-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl overflow-hidden shadow-lg mb-16">
                <div className="px-6 py-8 md:flex items-center justify-between">
                  <div className="text-white mb-6 md:mb-0">
                    <h4 className="font-bold text-xl mb-2">
                      Still have questions?
                    </h4>
                    <p className="text-indigo-100 max-w-xl">
                      Our customer support team is ready to assist you with any
                      questions about this product. We typically respond within
                      24 hours.
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

// Guarantee card component
const GuaranteeCard = ({
  icon,
  title,
  description,
  bgColor = "bg-white",
  borderColor = "border-gray-200",
  iconBgColor = "bg-gray-100",
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
      <p className="text-gray-600 text-sm">{description}</p>
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
          isOpen ? "bg-indigo-50" : "bg-white hover:bg-gray-50"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={`font-medium ${
            isOpen ? "text-indigo-700" : "text-gray-900"
          }`}
        >
          {question}
        </span>
        <span
          className={`ml-6 flex-shrink-0 p-1 rounded-full ${
            isOpen ? "bg-indigo-100" : ""
          }`}
        >
          {isOpen ? (
            <FiChevronUp
              className={`h-5 w-5 ${
                isOpen ? "text-indigo-500" : "text-gray-500"
              }`}
            />
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
