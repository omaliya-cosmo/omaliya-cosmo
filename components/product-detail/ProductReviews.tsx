"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiStar,
  FiUser,
  FiMessageSquare,
  FiSearch,
  FiFilter,
  FiCheck,
  FiThumbsUp,
  FiThumbsDown,
  FiX,
  FiChevronDown,
  FiAlertCircle,
} from "react-icons/fi";
import { Review, Customer } from "@prisma/client";
import { getCustomerFromToken } from "@/app/actions";

// Define type with included relations based on the schema
type ReviewWithCustomer = Review & {
  customer: Customer;
};

interface ProductReviewsProps {
  reviews: ReviewWithCustomer[];
  productId: string;
}

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

const ProductReviews: React.FC<ProductReviewsProps> = ({
  reviews: initialReviews,
  productId,
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [sortOption, setSortOption] = useState("newest");
  const [filterOption, setFilterOption] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [reviews, setReviews] = useState<ReviewWithCustomer[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  // Initialize reviews on component mount and when initialReviews changes
  useEffect(() => {
    if (initialReviews && Array.isArray(initialReviews)) {
      setReviews(initialReviews);
    }
  }, []);

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((review) => review.rating === rating).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating, count, percentage };
  });

  // Handle filtering and sorting
  useEffect(() => {
    if (!initialReviews || !Array.isArray(initialReviews)) return;

    let filteredReviews = [...initialReviews];

    // Apply filters
    if (filterOption !== "all") {
      const ratingFilter = parseInt(filterOption);
      filteredReviews = filteredReviews.filter(
        (review) => review.rating === ratingFilter
      );
    }

    // Apply search
    if (searchQuery.trim()) {
      filteredReviews = filteredReviews.filter((review) =>
        review.review?.toLowerCase().includes(searchQuery.toLowerCase())
      );
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
  }, [initialReviews, sortOption, filterOption, searchQuery]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const customer = await getCustomerFromToken();

      if (!customer) {
        throw new Error("You must be logged in to submit a review");
      }

      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: customer.id,
          rating: reviewRating,
          review: reviewText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      const newReview = await response.json();

      // Make sure the new review has the expected format
      if (newReview && newReview.id) {
        // If the API doesn't return the customer info with the review,
        // we need to add it manually
        if (!newReview.customer && customer) {
          newReview.customer = customer;
        }

        // Add the new review to the reviews array and update the state
        setReviews((prevReviews) => [newReview, ...prevReviews]);
      }

      setReviewText("");
      setReviewRating(5);
      setShowReviewForm(false);

      // Show success message
      alert("Thank you for your review!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(
        `Failed to submit review: ${
          error instanceof Error ? error.message : "Please try again"
        }`
      );
    } finally {
      setIsSubmitting(false);
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

  // Display reviews (either all or limited number)
  const displayedReviews = showAllReviews
    ? reviews
    : (reviews || []).slice(0, 5);
  const hasMoreReviews = (reviews || []).length > 5;

  return (
    <motion.div
      className="py-10 pt-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      id="reviews"
    >
      {/* Review summary */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        variants={itemVariants}
      >
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
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
                Based on {reviews.length}{" "}
                {reviews.length === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>

          {/* Rating distribution */}
          <div className="mt-6 space-y-3">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center">
                <button
                  onClick={() => setFilterOption(rating.toString())}
                  className="w-16 text-sm text-gray-700 hover:text-indigo-600 hover:underline text-left"
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
        </div>

        <div className="flex flex-col justify-between bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 p-6 shadow-sm">
          <div>
            <h3 className="font-medium text-indigo-900 mb-2">
              Share your experience
            </h3>
            <p className="text-indigo-800 opacity-90 mb-6">
              Your feedback helps other shoppers make better decisions and
              allows us to improve our products.
            </p>
          </div>
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-indigo-600 text-white px-5 py-3 rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-sm flex items-center justify-center"
          >
            <FiMessageSquare className="mr-2" />
            Write a Review
          </button>
        </div>
      </motion.div>

      {/* Search, sort and filter controls */}
      <motion.div
        className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
        variants={itemVariants}
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search in reviews"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-64 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortOptions(!showSortOptions)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
            >
              <span className="text-sm">
                Sort by:{" "}
                {SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label}
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
                            ? "bg-indigo-50 text-indigo-700 font-medium"
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
          </div>

          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterOptions(!showFilterOptions)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 ${
                filterOption !== "all"
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-gray-300 bg-white text-gray-700"
              }`}
            >
              <FiFilter
                className={filterOption !== "all" ? "text-indigo-500" : ""}
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
                            ? "bg-indigo-50 text-indigo-700 font-medium"
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
          </div>
        </div>
      </motion.div>

      {/* Review form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8 border rounded-lg p-6 bg-white shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Write a Review
              </h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview}>
              {/* Overall rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Rating
                </label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setReviewRating(star)}
                      className="p-1"
                    >
                      <FiStar
                        className={
                          star <= (hoverRating || reviewRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }
                        size={32}
                      />
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {reviewRating === 5
                    ? "Excellent - Very satisfied with this product"
                    : reviewRating === 4
                    ? "Good - Happy with this product"
                    : reviewRating === 3
                    ? "Average - Product is okay"
                    : reviewRating === 2
                    ? "Poor - Product has issues"
                    : "Terrible - Very disappointed"}
                </p>
              </div>

              {/* Review text */}
              <div className="mb-4">
                <label
                  htmlFor="review"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Your Review
                </label>
                <textarea
                  id="review"
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Share your experience with this product. What did you like or dislike? Would you recommend it to others?"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 10 characters, maximum 1000 characters
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || reviewText.length < 10}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>Submit Review</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review list */}
      <motion.div className="mt-4 space-y-6" variants={itemVariants}>
        {reviews.length === 0 ? (
          searchQuery || filterOption !== "all" ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
              <FiAlertCircle className="mx-auto text-gray-400 mb-3" size={36} />
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
                className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
              <FiMessageSquare
                className="mx-auto text-gray-400 mb-3"
                size={36}
              />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No reviews yet
              </h3>
              <p className="text-gray-600 mb-4">
                Be the first to share your thoughts on this product
              </p>
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 inline-flex items-center"
              >
                <FiStar className="mr-2" />
                Write a Review
              </button>
            </div>
          )
        ) : (
          <motion.div
            className="space-y-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {displayedReviews.map((review) => {
              // Safety check for review.customer
              if (!review || !review.customer) {
                console.error("Invalid review data:", review);
                return null;
              }

              const customerInitials = `${
                review.customer.firstName?.charAt(0) || ""
              }${review.customer.lastName?.charAt(0) || ""}`;
              const isExpanded = activeReviewId === review.id;

              return (
                <motion.div
                  key={review.id}
                  className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                    isExpanded
                      ? "shadow-md border-indigo-200"
                      : "border-gray-200"
                  }`}
                  variants={itemVariants}
                >
                  <div className="p-6">
                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 mr-4 flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-medium text-lg">
                          {customerInitials}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div>
                            <h4 className="font-medium text-gray-900 flex items-center">
                              {`${review.customer.firstName} ${review.customer.lastName}`.trim()}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {timeAgo(review.date)}
                            </p>
                          </div>

                          <div className="flex items-center">
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
                        </div>

                        {/* Review content */}
                        <div
                          className={`text-gray-700 prose prose-sm max-w-none mt-3 ${
                            review.review &&
                            review.review.length > 300 &&
                            !isExpanded
                              ? "line-clamp-3"
                              : ""
                          }`}
                        >
                          <p>
                            {review.review || "No written review provided."}
                          </p>
                        </div>

                        {/* Read more / less button */}
                        {review.review && review.review.length > 300 && (
                          <button
                            onClick={() =>
                              setActiveReviewId(isExpanded ? null : review.id)
                            }
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-2"
                          >
                            {isExpanded ? "Show less" : "Read more"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Load more button */}
            {hasMoreReviews && (
              <motion.div
                className="flex justify-center pt-4"
                variants={itemVariants}
              >
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="text-indigo-600 hover:text-indigo-800 px-4 py-2 border border-indigo-200 rounded-md hover:bg-indigo-50"
                >
                  {showAllReviews
                    ? `Show less reviews`
                    : `Load all ${reviews.length} reviews`}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProductReviews;
