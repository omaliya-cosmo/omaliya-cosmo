"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  FiArrowLeft,
  FiTrash2,
  FiStar,
  FiFilter,
  FiSearch,
  FiChevronDown,
  FiAlertCircle,
  FiUser,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Review, Customer, Product } from "@prisma/client";

// Define types with included relations based on the schema
type ReviewWithCustomer = Review & {
  customer: Customer;
};

type ProductWithReviews = Product & {
  reviews: ReviewWithCustomer[];
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "highest", label: "Highest rating" },
  { value: "lowest", label: "Lowest rating" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All ratings" },
  { value: "5", label: "5 stars" },
  { value: "4", label: "4 stars" },
  { value: "3", label: "3 stars" },
  { value: "2", label: "2 stars" },
  { value: "1", label: "1 star" },
];

const ProductReviewsPage = ({ params }: { params: { productId: string } }) => {
  const router = useRouter();
  const [product, setProduct] = useState<ProductWithReviews | null>(null);
  const [reviews, setReviews] = useState<ReviewWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("newest");
  const [filterOption, setFilterOption] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  // Fetch product with reviews
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/products/${params.productId}?reviews=true`
        );
        setProduct(response.data);
        setReviews(response.data.reviews || []);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product and reviews. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.productId]);

  // Handle filtering and sorting of reviews
  useEffect(() => {
    if (!product || !product.reviews) return;

    let filteredReviews = [...product.reviews];

    // Apply filters
    if (filterOption !== "all") {
      const ratingFilter = parseInt(filterOption);
      filteredReviews = filteredReviews.filter(
        (review) => review.rating === ratingFilter
      );
    }

    // Apply search
    if (searchQuery.trim()) {
      filteredReviews = filteredReviews.filter((review) => {
        const reviewText = review.review?.toLowerCase() || "";
        const customerName =
          `${review.customer.firstName} ${review.customer.lastName}`.toLowerCase();
        const customerEmail = review.customer.email.toLowerCase();
        const query = searchQuery.toLowerCase();

        return (
          reviewText.includes(query) ||
          customerName.includes(query) ||
          customerEmail.includes(query)
        );
      });
    }

    // Apply sorting
    switch (sortOption) {
      case "newest":
        filteredReviews.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case "oldest":
        filteredReviews.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        break;
      case "highest":
        filteredReviews.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        filteredReviews.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }

    setReviews(filteredReviews);
  }, [product, sortOption, filterOption, searchQuery]);

  // Confirm and delete review
  const handleDeleteReview = async () => {
    if (!deletingReviewId) return;

    try {
      setLoading(true);
      await axios.delete(
        `/api/products/${params.productId}/reviews/${deletingReviewId}`
      );

      // Update reviews state after deletion
      setReviews((prev) =>
        prev.filter((review) => review.id !== deletingReviewId)
      );

      // Also update the product state
      setProduct((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          reviews: prev.reviews.filter(
            (review) => review.id !== deletingReviewId
          ),
        };
      });

      setShowDeleteDialog(false);
      setDeletingReviewId(null);
    } catch (err) {
      console.error("Error deleting review:", err);
      setError("Failed to delete review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Time ago format
  const timeAgo = (dateString: Date | string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval === 1 ? `${interval} year ago` : `${interval} years ago`;
    }

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval === 1
        ? `${interval} month ago`
        : `${interval} months ago`;
    }

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval === 1 ? `${interval} day ago` : `${interval} days ago`;
    }

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval === 1 ? `${interval} hour ago` : `${interval} hours ago`;
    }

    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval === 1
        ? `${interval} minute ago`
        : `${interval} minutes ago`;
    }

    return "Just now";
  };

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count =
      product?.reviews.filter((review) => review.rating === rating).length || 0;
    const percentage = product?.reviews.length
      ? (count / product.reviews.length) * 100
      : 0;
    return { rating, count, percentage };
  });

  // Calculate average rating
  const averageRating = product?.reviews.length
    ? (
        product.reviews.reduce((sum, review) => sum + review.rating, 0) /
        product.reviews.length
      ).toFixed(1)
    : "0.0";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading && !product) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiAlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page header with breadcrumb */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <button
                onClick={() =>
                  router.push(`/admin/inventory/products/${params.productId}`)
                }
                className="hover:text-blue-600 flex items-center"
              >
                <FiArrowLeft className="mr-1" />
                Back to Product
              </button>
              <span className="mx-2">/</span>
              <span>Reviews</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              {product?.name} - Reviews
            </h1>
            <p className="text-gray-600 mt-1">
              Manage customer reviews for this product
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Dashboard */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <FiStar className="mr-2 text-yellow-500" />
            Product Reviews
          </h2>
          <p className="text-gray-600 text-sm">
            View and manage customer feedback
          </p>
        </div>

        <div className="p-6">
          {/* Review summary */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div
              variants={itemVariants}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex items-center">
                <span className="text-5xl font-bold text-gray-900 mr-4">
                  {averageRating}
                </span>
                <div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={
                          star <= Math.round(Number(averageRating))
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }
                        size={20}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Based on {product?.reviews.length || 0}{" "}
                    {product?.reviews.length === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>

              {/* Rating distribution */}
              <div className="mt-6 space-y-3">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center">
                    <button
                      onClick={() => setFilterOption(rating.toString())}
                      className="w-16 text-sm text-gray-700 hover:text-blue-600 hover:underline text-left"
                    >
                      {rating} {rating === 1 ? "star" : "stars"}
                    </button>
                    <div className="flex-1 h-3 mx-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-yellow-400"
                      />
                    </div>
                    <span className="w-10 text-sm text-gray-700 text-right">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-6 shadow-sm flex flex-col justify-center"
            >
              <div className="text-center">
                <FiStar className="mx-auto text-blue-500 mb-4" size={36} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Review Management
                </h3>
                <p className="text-blue-800 opacity-90 mb-4">
                  Here you can view all reviews submitted for this product and
                  remove any inappropriate content.
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-700 mb-2">
                      {product?.reviews.length || 0}
                    </div>
                    <p className="text-gray-600 text-sm">Total Reviews</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Search and filters */}
          <motion.div
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search in reviews or by customer"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-64 focus:ring-blue-500 focus:border-blue-500"
              />
            </motion.div>

            <div className="flex flex-wrap gap-3">
              {/* Sort dropdown */}
              <motion.div variants={itemVariants} className="relative">
                <button
                  onClick={() => setShowSortOptions(!showSortOptions)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
                >
                  <span className="text-sm">
                    Sort by:{" "}
                    {
                      SORT_OPTIONS.find((opt) => opt.value === sortOption)
                        ?.label
                    }
                  </span>
                  <FiChevronDown
                    className={`transition-transform ${
                      showSortOptions ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showSortOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-12 z-10 w-56 mt-1 bg-white border border-gray-200 rounded-md shadow-lg"
                    >
                      <div className="py-1">
                        {SORT_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortOption(option.value);
                              setShowSortOptions(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm ${
                              sortOption === option.value
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Filter dropdown */}
              <motion.div variants={itemVariants} className="relative">
                <button
                  onClick={() => setShowFilterOptions(!showFilterOptions)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 ${
                    filterOption !== "all"
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  <FiFilter
                    className={filterOption !== "all" ? "text-blue-500" : ""}
                  />
                  <span className="text-sm">
                    {filterOption === "all"
                      ? "Filter reviews"
                      : FILTER_OPTIONS.find((opt) => opt.value === filterOption)
                          ?.label}
                  </span>
                  <FiChevronDown
                    className={`transition-transform ${
                      showFilterOptions ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showFilterOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-12 z-10 w-56 mt-1 bg-white border border-gray-200 rounded-md shadow-lg"
                    >
                      <div className="py-1">
                        {FILTER_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setFilterOption(option.value);
                              setShowFilterOptions(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm ${
                              filterOption === option.value
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>

          {/* Reviews list */}
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {reviews.length === 0 ? (
              <motion.div
                variants={itemVariants}
                className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200"
              >
                {searchQuery || filterOption !== "all" ? (
                  <>
                    <FiAlertCircle
                      className="mx-auto text-gray-400 mb-3"
                      size={36}
                    />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No matching reviews
                    </h3>
                    <p className="text-gray-600">
                      {searchQuery && filterOption !== "all"
                        ? `No ${filterOption}-star reviews containing "${searchQuery}"`
                        : searchQuery
                        ? `No reviews containing "${searchQuery}"`
                        : `No ${filterOption}-star reviews`}
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setFilterOption("all");
                      }}
                      className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear filters
                    </button>
                  </>
                ) : (
                  <>
                    <FiStar className="mx-auto text-gray-400 mb-3" size={36} />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No reviews yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      This product hasn't received any reviews yet
                    </p>
                  </>
                )}
              </motion.div>
            ) : (
              <>
                {reviews.map((review) => {
                  const customerInitials = `${
                    review.customer.firstName?.charAt(0) || ""
                  }${review.customer.lastName?.charAt(0) || ""}`;
                  const isSelected = selectedReviewId === review.id;

                  return (
                    <motion.div
                      key={review.id}
                      variants={itemVariants}
                      className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                        isSelected
                          ? "shadow-md border-blue-200"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 mr-4 flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium text-lg">
                              {customerInitials || <FiUser />}
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-wrap justify-between items-start gap-2">
                              <div>
                                <h4 className="font-medium text-gray-900 flex items-center">
                                  {`${review.customer.firstName || ""} ${
                                    review.customer.lastName || ""
                                  }`.trim() || "Anonymous"}
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {review.customer.email} •{" "}
                                  {timeAgo(review.date)}
                                </p>
                              </div>

                              <div className="flex items-center">
                                <div className="flex mr-4">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <FiStar
                                      key={star}
                                      className={
                                        star <= review.rating
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-gray-300"
                                      }
                                      size={16}
                                    />
                                  ))}
                                </div>
                                <button
                                  onClick={() => {
                                    setDeletingReviewId(review.id);
                                    setShowDeleteDialog(true);
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FiTrash2 size={18} />
                                </button>
                              </div>
                            </div>

                            {/* Review content */}
                            <div className="text-gray-700 prose prose-sm max-w-none mt-3">
                              <p>
                                {review.review || "No written review provided."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div className="fixed z-[9999] inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-[10000]">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FiTrash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Review
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this review? This action
                        cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteDialog(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductReviewsPage;
