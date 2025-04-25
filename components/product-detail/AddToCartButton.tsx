"use client";
import React, { useState, useEffect } from "react";
import {
  FiShoppingCart,
  FiHeart,
  FiCheck,
  FiShare2,
  FiCreditCard,
  FiFacebook,
  FiTwitter,
  FiMail,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { Product } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/app/lib/hooks/CartContext";

interface AddToCartButtonProps {
  product: Product;
  quantity: number;
  currency: "LKR" | "USD";
}

// Toast notification component
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-5 right-5 p-4 rounded-md shadow-lg z-50 flex items-center ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      } text-white`}
    >
      {type === "success" ? <FiCheck className="mr-2" /> : null}
      {message}
    </motion.div>
  );
};

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  quantity,
  currency,
}) => {
  const router = useRouter();
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Use our cart context to refresh cart data
  const { refreshCart } = useCart();

  // Check if product is in stock and validate quantity
  const isInStock = product.stock > 0;
  const isQuantityValid = quantity <= product.stock;

  // Handle adding to cart
  const handleAddToCart = async () => {
    if (!isInStock || !isQuantityValid) {
      setToast({
        show: true,
        message: !isInStock
          ? "This product is out of stock"
          : "Requested quantity exceeds available stock",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Add to cart via API
      await axios.post("/api/cart", {
        productId: product.id,
        quantity,
        isBundle: false,
        replaceQuantity: false,
      });

      // Show success message
      setAddedToCart(true);
      setToast({
        show: true,
        message: `${quantity} ${
          quantity === 1 ? "item" : "items"
        } added to your cart`,
        type: "success",
      });

      // Refresh cart data in the context
      await refreshCart();

      // Reset "Added to Cart" state after 2 seconds
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setToast({
        show: true,
        message: "Failed to add item to cart. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle buy now (add to cart and redirect to checkout)
  const handleBuyNow = async () => {
    if (!isInStock || !isQuantityValid) {
      setToast({
        show: true,
        message: !isInStock
          ? "This product is out of stock"
          : "Requested quantity exceeds available stock",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First add to cart
      await axios.post("/api/cart", {
        productId: product.id,
        quantity,
        isBundle: false,
        replaceQuantity: true, // Replace existing quantity for buy now
      });

      // Refresh cart data in the context
      await refreshCart();

      // Show brief toast message
      setToast({
        show: true,
        message: "Redirecting to checkout...",
        type: "success",
      });

      // Short delay before redirect to show the toast
      setTimeout(() => {
        router.push("/checkout");
      }, 500);
    } catch (error) {
      console.error("Error adding to cart for checkout:", error);
      setToast({
        show: true,
        message: "Failed to proceed to checkout. Please try again.",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  const handleAddToWishlist = () => {
    // Toggle wishlist state
    setAddedToWishlist(!addedToWishlist);

    setToast({
      show: true,
      message: !addedToWishlist
        ? "Added to your wishlist"
        : "Removed from your wishlist",
      type: "success",
    });
  };

  // Main share function
  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  // Social sharing functions
  const shareViaFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      window.location.href
    )}`;
    window.open(url, "_blank");
    setShowShareOptions(false);
  };

  const shareViaTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `Check out ${product.name}`
    )}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank");
    setShowShareOptions(false);
  };

  const shareViaWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(
      `Check out ${product.name}: ${window.location.href}`
    )}`;
    window.open(url, "_blank");
    setShowShareOptions(false);
  };

  const shareViaEmail = () => {
    const url = `mailto:?subject=${encodeURIComponent(
      `Check out this product: ${product.name}`
    )}&body=${encodeURIComponent(
      `I thought you might be interested in this product:\n\n${product.name}\n\n${product.description}\n\n${window.location.href}`
    )}`;
    window.location.href = url;
    setShowShareOptions(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast({
      show: true,
      message: "Link copied to clipboard!",
      type: "success",
    });
    setShowShareOptions(false);
  };

  return (
    <div className="space-y-4">
      {/* Toast notifications */}
      <AnimatePresence>
        {toast?.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Main action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Add to Cart button */}
        <motion.button
          onClick={handleAddToCart}
          disabled={!isInStock || addedToCart || !isQuantityValid || isLoading}
          whileTap={{ scale: 0.95 }}
          className={`flex-1 flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            !isInStock || !isQuantityValid || isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : addedToCart
              ? "bg-green-600 hover:bg-green-700"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center">
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
              Processing...
            </span>
          ) : !isInStock ? (
            "Out of Stock"
          ) : !isQuantityValid ? (
            "Exceeds Available Stock"
          ) : addedToCart ? (
            <>
              <FiCheck className="mr-2" />
              Added to Cart
            </>
          ) : (
            <>
              <FiShoppingCart className="mr-2" />
              Add to Cart
            </>
          )}
        </motion.button>

        {/* Buy Now button */}
        <motion.button
          onClick={handleBuyNow}
          disabled={!isInStock || !isQuantityValid || isLoading}
          whileTap={{ scale: 0.95 }}
          className={`flex-1 flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
            !isInStock || !isQuantityValid || isLoading
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {isLoading ? (
            <span className="flex items-center">
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
              Processing...
            </span>
          ) : (
            <>
              <FiCreditCard className="mr-2" />
              Buy Now
            </>
          )}
        </motion.button>
      </div>

      {/* Secondary actions */}
      <div className="flex gap-3">
        {/* Wishlist button */}
        <motion.button
          onClick={handleAddToWishlist}
          whileTap={{ scale: 0.95 }}
          className={`flex-1 flex items-center justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            addedToWishlist
              ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 focus:ring-red-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-indigo-500"
          }`}
          title={addedToWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <FiHeart
            className={`mr-2 ${
              addedToWishlist ? "fill-red-600 text-red-600" : ""
            }`}
          />
          {addedToWishlist ? "Saved" : "Save to Wishlist"}
        </motion.button>

        {/* Share button */}
        <motion.div className="relative">
          <motion.button
            onClick={handleShare}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            title="Share Product"
          >
            <FiShare2 className="mr-2" />
            Share
          </motion.button>

          {/* Share options dropdown */}
          {showShareOptions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
            >
              <button
                onClick={shareViaFacebook}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
              >
                <FiFacebook className="mr-2 text-blue-600" />
                Facebook
              </button>
              <button
                onClick={shareViaTwitter}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
              >
                <FiTwitter className="mr-2 text-blue-400" />
                Twitter
              </button>
              <button
                onClick={shareViaWhatsApp}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
              >
                <FaWhatsapp className="mr-2 text-green-500" />
                WhatsApp
              </button>
              <button
                onClick={shareViaEmail}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
              >
                <FiMail className="mr-2 text-gray-500" />
                Email
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
              >
                <FiCheck className="mr-2 text-green-500" />
                Copy Link
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Stock warning */}
      {isInStock && product.stock < 5 && (
        <p className="text-sm text-red-600 font-medium flex items-center">
          <svg className="w-4 h-4 mr-1 fill-current" viewBox="0 0 24 24">
            <path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z" />
          </svg>
          Only {product.stock} left in stock - order soon!
        </p>
      )}

      {/* Product tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="pt-4">
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-800 rounded-full px-3 py-1 text-sm font-semibold shadow-sm hover:scale-105 hover:shadow-md transition-transform duration-200 ease-in-out"
              >
                # {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddToCartButton;
